from django.db import models
from django.core.validators import FileExtensionValidator

class Coins(models.Model):
    image = models.ImageField(upload_to='media/coinIcons', blank=True, null=True, verbose_name='image')
    symbol = models.CharField(max_length=10, unique=True, verbose_name="Symbol", blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL", blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"

    class Meta:
        db_table = 'coins'
        verbose_name = 'coin'
        verbose_name_plural = 'coins'
        ordering = ('symbol',)
