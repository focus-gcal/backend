from django.db.models import Case, F, IntegerField, Value, When
from ninja import Router
from schedules.models import ScheduleTemplate
from tasks.models import Task
from tasks.services import task_services
from users.auth.ninja_auth import JWTAuth

from .schemas.tasks import TaskCreateIn, TaskOut, TaskUpdateIn

router = Router()


@router.get("/", response={200: list[TaskOut]}, auth=JWTAuth())
def list_tasks(request):
    tasks = (
        Task.objects.select_related("schedule")
        .filter(user=request.auth)
        .annotate(
            status_group=Case(
                When(status="completed", then=Value(1)),  # group 2
                default=Value(0),  # group 1
                output_field=IntegerField(),
            ),
            deadline_open=Case(
                When(status="completed", then=Value(None)),
                default=F("deadline"),
            ),
            deadline_done=Case(
                When(status="completed", then=F("deadline")),
                default=Value(None),
            ),
        )
        .order_by(
            "status_group",  # non-completed first, completed second
            F("deadline_open").asc(nulls_last=True),  # group 1: earliest first
            F("deadline_done").desc(nulls_last=True),  # group 2: latest first
        )
    )
    tasks_list = [
        TaskOut(
            id=t.id,
            user_id=t.user_id,
            title=t.title,
            description=t.description,
            duration=t.duration,
            priority=t.priority,
            deadline=t.deadline,
            is_hard_deadline=t.is_hard_deadline,
            status=t.status,
            start_date=t.start_date,
            min_chunk=t.min_chunk,
            max_duration_chunk=t.max_duration_chunk,
            schedule_id=t.schedule_id,
            schedule_name=t.schedule.name if t.schedule else None,
        )
        for t in tasks
    ]
    return 200, tasks_list


@router.get("/{task_id}", response={200: TaskOut, 404: dict}, auth=JWTAuth())
def get_task(request, task_id: int):
    try:
        task = Task.objects.select_related("schedule").get(
            user=request.auth, id=task_id
        )
    except Task.DoesNotExist:
        return 404, {"error": "Task not found."}
    return 200, TaskOut(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        duration=task.duration,
        priority=task.priority,
        deadline=task.deadline,
        is_hard_deadline=task.is_hard_deadline,
        status=task.status,
        start_date=task.start_date,
        min_chunk=task.min_chunk,
        max_duration_chunk=task.max_duration_chunk,
        schedule_id=task.schedule_id,
        schedule_name=task.schedule.name if task.schedule else None,
    )


@router.delete("/{task_id}", response={200: dict, 404: dict}, auth=JWTAuth())
def delete_task(request, task_id: int):
    try:
        task = Task.objects.get(user=request.auth, id=task_id)
    except Task.DoesNotExist:
        return 404, {"error": "Task not found."}
    task.delete()
    return 200, {"message": "Task deleted successfully."}


@router.patch(
    "/{task_id}", response={200: TaskOut, 400: dict, 404: dict}, auth=JWTAuth()
)
def update_task(request, task_id: int, data: TaskUpdateIn):
    task, err = task_services.update_task(request.auth, task_id, data)
    if err:
        status, body = err
        return status, body
    return 200, TaskOut(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        duration=task.duration,
        priority=task.priority,
        deadline=task.deadline,
        is_hard_deadline=task.is_hard_deadline,
        status=task.status,
        start_date=task.start_date,
        min_chunk=task.min_chunk,
        max_duration_chunk=task.max_duration_chunk,
        schedule_id=task.schedule_id,
        schedule_name=task.schedule.name if task.schedule else None,
    )


@router.post("/", response={200: TaskOut, 400: dict}, auth=JWTAuth())
def create_task(request, data: TaskCreateIn):
    schedule_id = None
    schedule_name = data.schedule_name
    if schedule_name is not None:
        template = ScheduleTemplate.objects.filter(
            user=request.auth, name=schedule_name
        ).first()
        if template is None:
            return 400, {"error": f"Schedule not found: '{schedule_name}'."}
        schedule_id = template.id

    try:
        task = Task.objects.create(
            user=request.auth,
            title=data.title,
            description=data.description,
            duration=data.duration,
            priority=data.priority,
            deadline=data.deadline,
            is_hard_deadline=data.is_hard_deadline,
            status=data.status,
            start_date=data.start_date,
            min_chunk=data.min_chunk,
            max_duration_chunk=data.max_duration_chunk,
            schedule_id=schedule_id,
        )
    except Exception as e:
        return 400, {"error": str(e) + "."}
    return 200, TaskOut(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        duration=task.duration,
        priority=task.priority,
        deadline=task.deadline,
        is_hard_deadline=task.is_hard_deadline,
        status=task.status,
        start_date=task.start_date,
        min_chunk=task.min_chunk,
        max_duration_chunk=task.max_duration_chunk,
        schedule_id=task.schedule_id,
        schedule_name=task.schedule.name if task.schedule else None,
    )
