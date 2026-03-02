from schedules.models import Schedule
from schedules.selectors.schedule_selector import get_schedule_by_id_for_user


def get_schedule_tasks(schedule: Schedule) -> list[dict]:
    """Return tasks assigned to this schedule's template. Each item is {"id": int, "title": str}."""
    if not schedule.schedule_template_id:
        return []
    return [
        {"id": t.id, "title": t.title} for t in schedule.schedule_template.tasks.all()
    ]


def update_schedule(
    user, schedule_id: int, data
) -> tuple[Schedule | None, tuple[int, dict] | None]:
    """Returns (schedule, None) on success, (None, (status_code, body)) on error."""
    schedule = get_schedule_by_id_for_user(user, schedule_id)
    if schedule is None:
        return None, (404, {"error": "Schedule not found."})

    payload = data.model_dump(exclude_unset=True)

    # Keep day_of_week in sync with days_of_week for backwards-compat and ordering
    days = payload.pop("days_of_week", None)
    if days is not None:
        # data validators already ensure values are valid, unique, and sorted
        schedule.days_of_week = days
        if days:
            schedule.day_of_week = days[0]

    for key, value in payload.items():
        setattr(schedule, key, value)
    try:
        schedule.full_clean()
        schedule.save()
    except Exception as e:
        return None, (400, {"error": str(e)})
    return schedule, None
