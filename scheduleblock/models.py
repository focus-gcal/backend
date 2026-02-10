from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError

class ScheduledBlock(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks")

    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blocks",
    )


    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("end_time must be after start_time")
        if self.task and self.task.user_id != self.user_id:
            raise ValidationError("Block user must match task user")
        qs = ScheduledBlock.objects.filter(user=self.user)

        # When updating an existing block, exclude itself
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        ##lt means djano will look for less than and gt means greater than, searches for overlapping blocks 
        overlaps = qs.filter(
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )

        if overlaps.exists():
            raise ValidationError("This block overlaps with an existing block.")

        if not self.task and not self.label:
            raise ValidationError("Non-task blocks must have a label")

    def __str__(self):
        name = self.task.title if self.task else self.label
        return f"{self.user.username}: {name} ({self.start_time} → {self.end_time})"
