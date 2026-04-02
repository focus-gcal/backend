from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class TaskInput(BaseModel):
    """
    Normalized task input for scheduling.

    This is *input context* (from DB/tools), not embedded into schedule blocks.

    `schedule_template_id` is None when the task is not assigned to a template.
    `allowed_windows` must be filled by your loader for *every* task you want
    to place: expand the assigned template into concrete datetimes inside the
    horizon, or use a product default (e.g. wide daytime band) when unassigned.
    The validator checks each block only against *that task's* windows.
    """

    task_id: str
    title: str
    remaining_duration_min: int = Field(ge=0)

    schedule_template_id: int | None = None
    allowed_windows: list[TimeWindow] = Field(default_factory=list)

    # Constraints / preferences
    priority: int | None = None
    deadline: datetime | None = None
    is_hard_deadline: bool = True
    min_chunk_min: int = Field(default=15, ge=1)
    max_chunk_min: int = Field(default=240, ge=1)


class TimeWindow(BaseModel):
    start: datetime
    end: datetime


class ScheduledBlock(BaseModel):
    block_id: str
    task_id: str
    start: datetime
    end: datetime
    duration_min: int = Field(ge=1)


class DraftSchedule(BaseModel):
    schema_version: Literal[1] = 1
    horizon: TimeWindow
    blocks: list[ScheduledBlock] = Field(default_factory=list)
    unscheduled_task_ids: list[str] = Field(default_factory=list)
    notes: str | None = None


class ValidationError(BaseModel):
    code: str
    message: str
    task_id: str | None = None
    block_ids: list[str] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)
    hint: str | None = None


class ValidationResult(BaseModel):
    valid: bool
    errors: list[ValidationError] = Field(default_factory=list)
    warnings: list[ValidationError] = Field(default_factory=list)
