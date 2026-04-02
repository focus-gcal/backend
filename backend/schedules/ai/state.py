from __future__ import annotations

from datetime import datetime
from typing import Literal, NotRequired, TypedDict

from schedules.ai.schemas import DraftSchedule, TaskInput, ValidationResult


class SchedulerState(TypedDict):
    """
    One dict-shaped state object per LangGraph run.

    Per-task availability lives on each TaskInput.allowed_windows (not on state),
    so tasks with a schedule template vs without can use different windows.

    Keys marked NotRequired may be absent until a node sets them, or you can
    set them to None in init_run — both patterns work; keep nodes consistent.
    """

    # Set at run start
    user_id: int
    run_id: str
    timezone: str
    horizon_start: datetime
    horizon_end: datetime
    tasks: list[TaskInput]
    attempt_count: int
    max_retries: int
    status: Literal["pending", "success", "failed"]

    # Filled during the graph (optional until those steps run)
    draft_schedule: NotRequired[DraftSchedule | None]
    validation_result: NotRequired[ValidationResult | None]
    revision_feedback: NotRequired[str | None]
    final_schedule: NotRequired[DraftSchedule | None]
