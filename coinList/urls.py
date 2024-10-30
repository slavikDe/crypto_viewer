from django.urls import path
from coinList import views

app_name = 'coinList'

urlpatterns = [
    path('', views.coin_list, name='index'),
    path('search/', views.coin_list, name='search'),
]
