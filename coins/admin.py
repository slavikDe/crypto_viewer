from django.contrib import admin

from coins.models import Coins
# Register your models here.

# class CoinsAdmin(admin.ModelAdmin):
#     exclude = ('price', 'change', 'volume', 'cap')

# admin.site.register(Coins, CoinsAdmin)

@admin.register(Coins)
class CoinsAdmin(admin.ModelAdmin):
    exclude = ('price', 'change', 'volume', 'cap')
    prepopulated_fields = {'slug': ('symbol',)}