import json
from pathlib import Path

LOG_FILE = Path("stats.jsonl")


def append_stat(event: dict) -> None:
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")
