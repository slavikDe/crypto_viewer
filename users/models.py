from django.contrib.auth.models import AbstractUser
from django.core.files.uploadedfile import UploadedFile
from django.db import models
import uuid
from coins.models import Coins


class Users(AbstractUser):
    user_custom_pair = models.CharField(blank=True, null=True)
    image = models.ImageField(upload_to='users_images', blank=True, null=True, verbose_name="avatar")
    favorite_coins_id = models.CharField(blank=True, null=True, max_length=200, verbose_name="favorite coins")

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username


