from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class DayOfWeek(models.IntegerChoices):
    MONDAY = 0, "Mon"
    TUESDAY = 1, "Tue"
    WEDNESDAY = 2, "Wed"
    THURSDAY = 3, "Thu"
    FRIDAY = 4, "Fri"
    SATURDAY = 5, "Sat"
    SUNDAY = 6, "Sun"


class ScheduleTemplate(models.Model):
    """Logical schedule (e.g. 'Work') — unique name per user. Tasks assign to this."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="schedule_templates",
    )
    name = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"], name="unique_user_schedule_name"
            ),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.name}"


class Schedule(models.Model):
    """One time block of a schedule (e.g. 'Work' on Monday 9-5). A template can have many slots."""

    schedule_template = models.ForeignKey(
        ScheduleTemplate,
        on_delete=models.CASCADE,
        related_name="slots",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    name = models.CharField(max_length=100)
    day_of_week = models.PositiveSmallIntegerField(choices=DayOfWeek.choices)

    days_of_week = models.JSONField(default=list, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")
        if self.days_of_week:
            invalid = [d for d in self.days_of_week if d not in range(7)]
            if invalid:
                raise ValidationError(
                    "days_of_week must contain integers 0 (Mon) through 6 (Sun)."
                )

    def __str__(self):
        return f"{self.name} ({self.get_day_of_week_display()} {self.start_time}-{self.end_time})"
