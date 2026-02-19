import schedules
import schedules.models
from django.conf import settings
from django.db import models


# Create your models here.
class TaskStatus(models.TextChoices):
    TODO = "todo", "To Do"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    BLOCKED = "blocked", "Blocked"


class TaskPriority(models.IntegerChoices):
    LOW = 1, "Low"
    MEDIUM = 2, "Medium"
    HIGH = 3, "High"


class Task(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField()
    priority = models.PositiveSmallIntegerField(
        choices=TaskPriority.choices, default=TaskPriority.LOW
    )
    deadline = models.DateTimeField(null=True, blank=True)
    is_hard_deadline = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO
    )
    start_date = models.DateTimeField(null=True, blank=True)
    min_chunk = models.PositiveIntegerField(null=True, blank=True)
    max_duration_chunk = models.PositiveIntegerField(null=True, blank=True)
    schedule = models.ForeignKey(
        schedules.models.Schedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
