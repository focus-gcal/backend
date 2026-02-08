from django.db import models

import schedules
import schedules.models
# Create your models here.

class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("blocked", "Blocked")
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank = True)
    duration = models.PositiveIntegerField()
    priority = models.PositiveSmallIntegerField(default = 3)
    deadline = models.DateTimeField(null = True, blank = True)
    is_hard_deadline = models.BooleanField(default = False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    stardates = models.DateTimeField(null = True, blank = True)
    minchunk = models.PositiveIntegerField(default = 3)
    max_duration_chunk = models.PositiveIntegerField(null= True, blank = True)
    schedule = models.ForeignKey(schedules.models.Schedule, on_delete=models.SET_NULL, null=True, blank=True
                , related_name="tasks")