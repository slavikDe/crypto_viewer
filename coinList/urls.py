from django.urls import path
from coinList import views

app_name = 'coinList'

urlpatterns = [
    path('', views.coin_list, name='index'),
    path('search/', views.coin_list, name='search'),
    path('api/coins/', views.get_all_coins, name='get_all_coins'),

    # path('get-coin-price/', views.get_coin_price, name='get_coin_price'),
    path('add-custom-coin/', views.add_custom_coin, name='add_coin'),
    path('add-default-coin/', views.add_default_coin, name='add_coin'),
    path('test-coin/', views.test_coin, name='test_coin'),

]
