"""SpamAssassin via spamc - single entry point in repo."""
from __future__ import annotations

import shutil
import subprocess
from typing import Any


def analyze_spamassassin(raw: bytes) -> dict[str, Any]:
    if not shutil.which("spamc"):
        return {"available": False, "score": None, "rules": []}

    try:
        proc = subprocess.run(
            ["spamc", "-c"],
            input=raw,
            capture_output=True,
            timeout=30,
            check=False,
        )
    except (subprocess.TimeoutExpired, OSError):
        return {"available": False, "score": None, "rules": []}

    if proc.returncode not in (0, 1):
        return {"available": False, "score": None, "rules": []}

    try:
        score = float(proc.stdout.decode("utf-8", errors="replace").strip().split()[0])
    except (ValueError, IndexError):
        score = None

    return {"available": True, "score": score, "rules": []}
