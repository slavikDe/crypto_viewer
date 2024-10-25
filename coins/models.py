from django.db import models

class Coins(models.Model):
    image = models.FileField(upload_to='coins_images', blank=True, null=True, verbose_name='image')
    symbol = models.CharField(max_length=10, unique=True, verbose_name="Symbol", blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL", blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    change = models.CharField(max_length=10, blank=True, null=True)
    volume = models.DecimalField(max_digits=12, decimal_places=3, blank=True, null=True)
    cap = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"

    class Meta:
        db_table = 'coins'
        verbose_name = 'coin'
        verbose_name_plural = 'coins'
