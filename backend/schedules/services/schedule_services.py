from collections import defaultdict

from schedules.models import Schedule, ScheduleTemplate
from schedules.selectors.schedule_selector import get_schedule_template_by_id_for_user


def _validate_blocks_for_bulk(blocks) -> None:
    """
    Validate blocks: each must have end > start; no two blocks on the same day
    may overlap. Raises ValueError if invalid. Used before bulk_create.
    """
    if not blocks:
        return
    for b in blocks:
        if b.end_time <= b.start_time:
            raise ValueError("End time must be after start time.")
    by_day = defaultdict(list)
    for b in blocks:
        by_day[b.day_of_week].append((b.start_time, b.end_time))
    for day, ranges in by_day.items():
        ranges.sort(key=lambda r: r[0])
        for i in range(1, len(ranges)):
            if ranges[i][0] < ranges[i - 1][1]:
                raise ValueError("Time blocks on the same day cannot overlap.")


def get_schedule_template_detail(
    user, template_id: int
) -> tuple[ScheduleTemplate | None, tuple[int, dict] | None]:
    """
    Fetch a single schedule template for the user, including its slots and tasks.

    Returns (template, None) on success, (None, (status, body)) on error.
    """
    template = get_schedule_template_by_id_for_user(user, template_id)
    if template is None:
        return None, (404, {"error": "Schedule not found."})
    return template, None


def create_schedule_template(
    user, data
) -> tuple[ScheduleTemplate | None, tuple[int, dict] | None]:
    """
    Create a new schedule template and its time blocks.

    `data` is expected to be a ScheduleCreateIn-like object with
    `.name` and `.blocks` (ScheduleBlockIn instances).
    """
    try:
        blocks = data.blocks or []
        if not blocks:
            return None, (400, {"error": "At least one block is required."})
        _validate_blocks_for_bulk(blocks)
        template = ScheduleTemplate.objects.create(user=user, name=data.name)
        Schedule.objects.bulk_create(
            [
                Schedule(
                    schedule_template=template,
                    user=user,
                    name=template.name,
                    day_of_week=b.day_of_week,
                    start_time=b.start_time,
                    end_time=b.end_time,
                )
                for b in blocks
            ]
        )
    except ValueError as e:
        return None, (400, {"error": str(e)})
    except Exception as e:
        return None, (400, {"error": str(e)})

    # Reload with slots/tasks prefetch for downstream usage
    template = get_schedule_template_by_id_for_user(user, template.id)
    return template, None


def update_schedule_template(
    user, template_id: int, data
) -> tuple[ScheduleTemplate | None, tuple[int, dict] | None]:
    """
    Update an existing schedule template (name and/or blocks).

    `data` is expected to be a ScheduleUpdateIn-like object with optional
    `.name` and `.blocks` (ScheduleBlockIn instances).
    """
    template = get_schedule_template_by_id_for_user(user, template_id)
    if template is None:
        return None, (404, {"error": "Schedule not found."})

    payload = data.model_dump(exclude_unset=True)

    # Update template name if provided
    name = payload.get("name")
    if name is not None:
        template.name = name

    # Replace blocks if provided (payload contains dicts; use `data.blocks` for typed items)
    blocks_payload = payload.get("blocks")
    if blocks_payload is not None:
        new_blocks = data.blocks or []
        if not new_blocks:
            return None, (400, {"error": "At least one block is required."})
        try:
            _validate_blocks_for_bulk(new_blocks)
        except ValueError as e:
            return None, (400, {"error": str(e)})
        template.slots.all().delete()
        Schedule.objects.bulk_create(
            [
                Schedule(
                    schedule_template=template,
                    user=user,
                    name=template.name,
                    day_of_week=b.day_of_week,
                    start_time=b.start_time,
                    end_time=b.end_time,
                )
                for b in new_blocks
            ]
        )

    try:
        template.full_clean()
        template.save()
    except Exception as e:
        return None, (400, {"error": str(e)})

    # Reload with slots/tasks prefetch for downstream usage
    template = get_schedule_template_by_id_for_user(user, template_id)
    return template, None
