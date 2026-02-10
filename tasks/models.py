from django.db import models

import schedules
import schedules.models
from focus_gcal import settings


# Create your models here.
class StatusChoices(models.TextChoices):
    TODO = "todo", "To Do"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    BLOCKED = "blocked", "Blocked"


class Task(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField()
    priority = models.PositiveSmallIntegerField(default=3)
    deadline = models.DateTimeField(null=True, blank=True)
    is_hard_deadline = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.TODO
    )
    stardates = models.DateTimeField(null=True, blank=True)
    minchunk = models.PositiveIntegerField(default=3)
    max_duration_chunk = models.PositiveIntegerField(null=True, blank=True)
    schedule = models.ForeignKey(
        schedules.models.Schedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
