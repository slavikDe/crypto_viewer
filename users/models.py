from django.contrib.auth.models import AbstractUser
from django.core.files.uploadedfile import UploadedFile
from django.db import models

from coins.models import Coins


class Users(AbstractUser):
    user_custom_pair = models.CharField(blank=True, null=True)
    user_avatar = models.ImageField(upload_to="media/avatars/", blank=True, null=True, verbose_name="Avatar")
    coins = models.ManyToManyField(Coins, blank=True, null=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username

