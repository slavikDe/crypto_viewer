from django.contrib import admin

from coins.models import Coins

# admin.site.register(Coins, CoinsAdmin)

@admin.register(Coins)
class CoinsAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('symbol',)}