from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models


# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)

    max_duration_chunk = models.PositiveIntegerField(
        default=60, validators=[MinValueValidator(1)]
    )

    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
