from ninja import Router
from schedules.models import Schedule, ScheduleTemplate
from schedules.selectors.schedule_selector import (
    get_schedule_by_id_for_user,
    get_schedules_for_user,
)
from schedules.services import schedule_services
from users.auth.ninja_auth import JWTAuth

from .schemas.schedules import (
    ScheduleCreateIn,
    ScheduleListOut,
    ScheduleOut,
    ScheduleTaskOut,
    ScheduleUpdateIn,
)

router = Router()


@router.get("/", response={200: list[ScheduleOut]}, auth=JWTAuth())
def list_schedules(request):
    schedules = get_schedules_for_user(request.auth)
    return 200, [
        ScheduleOut(
            id=s.id,
            user_id=s.user_id,
            name=s.name,
            days_of_week=s.days_of_week or [s.day_of_week],
            start_time=s.start_time,
            end_time=s.end_time,
        )
        for s in schedules
    ]


@router.get(
    "/{schedule_id}", response={200: ScheduleListOut, 404: dict}, auth=JWTAuth()
)
def get_schedule(request, schedule_id: int):
    schedule = get_schedule_by_id_for_user(request.auth, schedule_id)
    if schedule is None:
        return 404, {"error": "Schedule not found."}
    return 200, ScheduleListOut(
        id=schedule.id,
        user_id=schedule.user_id,
        name=schedule.name,
        days_of_week=schedule.days_of_week or [schedule.day_of_week],
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        tasks=[
            ScheduleTaskOut(**t) for t in schedule_services.get_schedule_tasks(schedule)
        ],
    )


@router.delete("/{schedule_id}", response={200: dict, 404: dict}, auth=JWTAuth())
def delete_schedule(request, schedule_id: int):
    schedule = get_schedule_by_id_for_user(request.auth, schedule_id)
    if schedule is None:
        return 404, {"error": "Schedule not found."}
    schedule.delete()
    return 200, {"message": "Schedule deleted successfully."}


@router.patch(
    "/{schedule_id}",
    response={200: ScheduleListOut, 400: dict, 404: dict},
    auth=JWTAuth(),
)
def update_schedule(request, schedule_id: int, data: ScheduleUpdateIn):
    schedule, err = schedule_services.update_schedule(request.auth, schedule_id, data)
    if err:
        status, body = err
        return status, body
    return 200, ScheduleListOut(
        id=schedule.id,
        user_id=schedule.user_id,
        name=schedule.name,
        days_of_week=schedule.days_of_week or [schedule.day_of_week],
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        tasks=[
            ScheduleTaskOut(**t) for t in schedule_services.get_schedule_tasks(schedule)
        ],
    )


@router.post("/", response={200: ScheduleListOut, 400: dict}, auth=JWTAuth())
def create_schedule(request, data: ScheduleCreateIn):
    try:
        template, _ = ScheduleTemplate.objects.get_or_create(
            user=request.auth, name=data.name
        )
        primary_day = data.days_of_week[0]
        schedule = Schedule.objects.create(
            schedule_template=template,
            user=request.auth,
            name=template.name,
            day_of_week=primary_day,
            days_of_week=data.days_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
        )
    except Exception as e:
        return 400, {"error": str(e)}
    return 200, ScheduleListOut(
        id=schedule.id,
        user_id=schedule.user_id,
        name=schedule.name,
        days_of_week=schedule.days_of_week or [schedule.day_of_week],
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        tasks=[
            ScheduleTaskOut(**t) for t in schedule_services.get_schedule_tasks(schedule)
        ],
    )
