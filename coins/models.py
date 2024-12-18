from django.db import models

class Coins(models.Model):
    symbol = models.CharField(max_length=20, unique=True, verbose_name="Symbol", blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name")
    image = models.ImageField( blank=True, null=True, verbose_name='image')
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL", blank=True, null=True)
    market_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Market ID")
    markets = models.ManyToManyField(
        'Market',
        related_name='coins',
        verbose_name="Markets",
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.symbol})"

    class Meta:
        db_table = 'coins'
        verbose_name = 'coin'
        verbose_name_plural = 'coins'
        ordering = ('symbol',)


class Market(models.Model):
    name = models.CharField(max_length=100, verbose_name="Name", blank=True, null=True)
    ws_url = models.CharField(max_length=100, verbose_name="WS URL", blank=True, null=True)
    base_url = models.CharField(max_length=100, verbose_name="Base URL", blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'markets'
        verbose_name = 'market'
        verbose_name_plural = 'markets'

