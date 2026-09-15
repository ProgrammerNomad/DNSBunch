"""Central tool_id → runner registry."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

Runner = Callable[..., Any]


class ToolNotFoundError(KeyError):
    pass


@dataclass(frozen=True)
class ToolMeta:
    category: str
    timeout_ms: int = 30_000


@dataclass
class ToolEntry:
    runner: Runner
    meta: ToolMeta


_REGISTRY: dict[str, ToolEntry] = {}


def register(tool_id: str, runner: Runner, meta: ToolMeta | dict[str, Any]) -> None:
    if isinstance(meta, dict):
        meta = ToolMeta(
            category=meta.get("category", "general"),
            timeout_ms=int(meta.get("timeout_ms", 30_000)),
        )
    _REGISTRY[tool_id] = ToolEntry(runner=runner, meta=meta)


def get(tool_id: str) -> ToolEntry:
    try:
        return _REGISTRY[tool_id]
    except KeyError as exc:
        raise ToolNotFoundError(tool_id) from exc


def list_tool_ids() -> list[str]:
    return sorted(_REGISTRY.keys())


def run_tool(tool_id: str, **kwargs: Any) -> Any:
    entry = get(tool_id)
    return entry.runner(**kwargs)
