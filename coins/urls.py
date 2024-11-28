from django.urls import path
from coins import views

app_name = 'coins'

urlpatterns = [
    path('api/historical_price', views.get_historical_price, name='get_historical_price'),

    path('<slug:coin_slug>/', views.coin, name='coin'),


]
