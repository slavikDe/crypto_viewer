from django.urls import path
from coinList import views

app_name = 'coinList'

urlpatterns = [
    path('', views.coin_list, name='index'),
    path('search/', views.coin_list, name='search'),
    path('addcoin/', views.add_coin, name='addcoin'),
    path('api/coins/', views.get_all_coins, name='get_all_coins'),
]
