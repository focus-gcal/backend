from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from focus_gcal.enums import DayOfWeek

class Schedule(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="schedules",
    )

    name = models.CharField(max_length=100)


    day_of_week = models.PositiveSmallIntegerField(choices=DayOfWeek.choices)

    start_time = models.TimeField()
    end_time = models.TimeField()
    
    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

    def __str__(self):
        return f"{self.name} ({self.get_day_of_week_display()} {self.start_time}-{self.end_time})"
