"""
Мультиплеер: хранит и синхронизирует состояние игроков в реальном времени.
POST /join — подключиться, получить player_id и текущий список игроков.
POST /update — отправить свою позицию.
GET  /players — получить список всех активных игроков.
"""

import json
import os
import time
import random
import string
from datetime import datetime

# In-memory хранилище (сбрасывается при перезапуске функции)
_players: dict = {}
_TIMEOUT = 10  # секунд до удаления неактивного игрока

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

STAGE_EMOJIS = ["🦟", "🪲", "🦎", "🪁", "🦅", "🐉"]
STAGE_COLORS = ["#6ee7b7", "#86efac", "#4ade80", "#93c5fd", "#60a5fa", "#fbbf24"]
NAMES = ["SkyWolf", "BugHunter", "DragonFly", "SwiftClaw", "NightBird", "IronWing", "DarkMoth", "GlowWorm"]


def _cleanup():
    now = time.time()
    dead = [pid for pid, p in _players.items() if now - p["ts"] > _TIMEOUT]
    for pid in dead:
        del _players[pid]


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    _cleanup()

    # ── POST /join
    if method == "POST" and "/join" in path:
        player_id = "p_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        stage_idx = 0
        _players[player_id] = {
            "id": player_id,
            "name": random.choice(NAMES) + str(random.randint(10, 99)),
            "x": random.uniform(800, 2400),
            "y": random.uniform(800, 2400),
            "mass": 0,
            "stage": stage_idx,
            "emoji": STAGE_EMOJIS[stage_idx],
            "color": STAGE_COLORS[stage_idx],
            "ts": time.time(),
        }
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "player_id": player_id,
                "players": list(_players.values()),
            }),
        }

    # ── POST /update
    if method == "POST" and "/update" in path:
        pid = body.get("player_id")
        if not pid or pid not in _players:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "player not found"})}
        stage = min(int(body.get("stage", 0)), 5)
        _players[pid].update({
            "x": float(body.get("x", _players[pid]["x"])),
            "y": float(body.get("y", _players[pid]["y"])),
            "mass": float(body.get("mass", 0)),
            "stage": stage,
            "emoji": STAGE_EMOJIS[stage],
            "color": STAGE_COLORS[stage],
            "ts": time.time(),
        })
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"players": list(_players.values())}),
        }

    # ── GET /players
    if method == "GET":
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"players": list(_players.values()), "count": len(_players)}),
        }

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
