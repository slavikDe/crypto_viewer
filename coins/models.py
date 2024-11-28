from django.db import models

class Coins(models.Model):
    symbol = models.CharField(max_length=20, unique=True, verbose_name="Symbol", blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name")
    image = models.ImageField( blank=True, null=True, verbose_name='image')
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL", blank=True, null=True)
    market = models.CharField(max_length=100, blank=True, null=True, verbose_name="Market")
    def __str__(self):
        return f"{self.name} ({self.symbol})"

    class Meta:
        db_table = 'coins'
        verbose_name = 'coin'
        verbose_name_plural = 'coins'
        ordering = ('symbol',)


# class Market(models.Model):
#     name = models.CharField(max_length=100, verbose_name="Name", blank=True, null=True)
#     coins = models.ManyToManyField(Coins)
#
#     def __str__(self):
#         return self.name
#
#     class Meta:
#         db_table = 'markets'
#         verbose_name = 'market'
#         verbose_name_plural = 'markets'



