from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from datetime import datetime
from typing import Any

from schedules.ai.schemas import (
    DraftSchedule,
    TaskInput,
    TimeWindow,
    ValidationError,
    ValidationResult,
)


def append(
    errors: list[ValidationError],
    *,
    code: str,
    message: str,
    task_id: str | None = None,
    block_ids: list[str] | None = None,
    details: dict[str, Any] | None = None,
    hint: str | None = None,
) -> None:
    errors.append(
        ValidationError(
            code=code,
            message=message,
            task_id=task_id,
            block_ids=block_ids or [],
            details=details or {},
            hint=hint,
        )
    )


def intervals_overlap(
    a_start: datetime,
    a_end: datetime,
    b_start: datetime,
    b_end: datetime,
) -> bool:
    return a_start < b_end and b_start < a_end


def _block_fully_inside_union_of_windows(
    start: datetime,
    end: datetime,
    windows: Iterable[TimeWindow],
) -> bool:
    """True if [start, end] is fully contained in at least one window."""
    for w in windows:
        if start >= w.start and end <= w.end:
            return True
    return False


def validate_draft(
    draft: DraftSchedule,
    *,
    tasks: list[TaskInput],
    horizon_start: datetime,
    horizon_end: datetime,
) -> ValidationResult:
    errors: list[ValidationError] = []
    warnings: list[ValidationError] = []

    task_by_id = {t.task_id: t for t in tasks}
    known_ids = set(task_by_id)

    if draft.horizon.start != horizon_start or draft.horizon.end != horizon_end:
        append(
            errors,
            code="HORIZON_MISMATCH",
            message="Draft horizon does not match run horizon.",
            details={
                "draft_start": draft.horizon.start.isoformat(),
                "draft_end": draft.horizon.end.isoformat(),
                "run_start": horizon_start.isoformat(),
                "run_end": horizon_end.isoformat(),
            },
            hint="Set draft.horizon to exactly the requested horizon_start and horizon_end.",
        )

    for b in draft.blocks:
        if b.start >= b.end:
            append(
                errors,
                code="INVALID_INTERVAL",
                message="Block start must be before end.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                details={"start": b.start.isoformat(), "end": b.end.isoformat()},
            )
            continue

        computed = int((b.end - b.start).total_seconds() // 60)
        if computed != b.duration_min:
            append(
                errors,
                code="DURATION_MISMATCH",
                message="duration_min does not match start/end.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                details={"duration_min": b.duration_min, "computed_min": computed},
                hint="Recompute duration_min from start and end.",
            )

        if b.start < horizon_start or b.end > horizon_end:
            append(
                errors,
                code="OUTSIDE_HORIZON",
                message="Block is outside scheduling horizon.",
                block_ids=[b.block_id],
                task_id=b.task_id,
            )

        if b.task_id not in task_by_id:
            append(
                errors,
                code="UNKNOWN_TASK",
                message="Block references unknown task_id.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                hint="Use only task_id values from the provided task list.",
            )
            continue

        t = task_by_id[b.task_id]
        length = int((b.end - b.start).total_seconds() // 60)
        if length < t.min_chunk_min or length > t.max_chunk_min:
            append(
                errors,
                code="CHUNK_BOUNDS",
                message="Block length violates min/max chunk for task.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                details={
                    "length_min": length,
                    "min_chunk_min": t.min_chunk_min,
                    "max_chunk_min": t.max_chunk_min,
                },
            )

        if t.deadline is not None and b.end > t.deadline:
            if t.is_hard_deadline:
                append(
                    errors,
                    code="DEADLINE_VIOLATION",
                    message="Block ends after task deadline.",
                    block_ids=[b.block_id],
                    task_id=b.task_id,
                    details={
                        "end": b.end.isoformat(),
                        "deadline": t.deadline.isoformat(),
                    },
                )
            else:
                append(
                    warnings,
                    code="DEADLINE_SOFT",
                    message="Block ends after soft deadline.",
                    block_ids=[b.block_id],
                    task_id=b.task_id,
                    details={
                        "end": b.end.isoformat(),
                        "deadline": t.deadline.isoformat(),
                    },
                )

        if not t.allowed_windows:
            append(
                errors,
                code="NO_AVAILABILITY_WINDOWS",
                message="Task has no allowed_windows; loader must set per-task availability.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                hint="Expand schedule template into windows for this horizon, or set default windows when task has no schedule.",
            )
        elif not _block_fully_inside_union_of_windows(
            b.start, b.end, t.allowed_windows
        ):
            append(
                errors,
                code="OUTSIDE_AVAILABILITY",
                message="Block is not fully inside this task's allowed_windows.",
                block_ids=[b.block_id],
                task_id=b.task_id,
                hint="Move block so it lies entirely within one of this task's allowed windows.",
            )

    blocks_sorted = sorted(draft.blocks, key=lambda x: x.start)
    for i in range(len(blocks_sorted)):
        for j in range(i + 1, len(blocks_sorted)):
            bi, bj = blocks_sorted[i], blocks_sorted[j]
            if intervals_overlap(bi.start, bi.end, bj.start, bj.end):
                append(
                    errors,
                    code="OVERLAP",
                    message="Two scheduled blocks overlap in time.",
                    block_ids=[bi.block_id, bj.block_id],
                    details={
                        "a": f"{bi.block_id}: {bi.start}–{bi.end}",
                        "b": f"{bj.block_id}: {bj.start}–{bj.end}",
                    },
                    hint="Shift or shorten one block so intervals do not overlap.",
                )

    minutes_by_task: defaultdict[str, int] = defaultdict(int)
    for b in draft.blocks:
        if b.task_id in known_ids:
            minutes_by_task[b.task_id] += int((b.end - b.start).total_seconds() // 60)

    for tid, total in minutes_by_task.items():
        t = task_by_id[tid]
        if total > t.remaining_duration_min:
            append(
                errors,
                code="OVERSCHEDULED_TASK",
                message="Sum of scheduled minutes exceeds remaining_duration_min.",
                task_id=tid,
                details={
                    "scheduled_min": total,
                    "remaining_duration_min": t.remaining_duration_min,
                },
                hint="Remove or shorten blocks for this task.",
            )

    for tid in draft.unscheduled_task_ids:
        if tid not in known_ids:
            append(
                errors,
                code="UNKNOWN_UNSCHEDULED_TASK",
                message="unscheduled_task_ids contains unknown task_id.",
                details={"task_id": tid},
            )

    valid = len(errors) == 0
    return ValidationResult(valid=valid, errors=errors, warnings=warnings)
