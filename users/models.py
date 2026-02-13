from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models


# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)

    max_duration_chunk = models.PositiveIntegerField(
        default=60, validators=[MinValueValidator(1)]
    )
