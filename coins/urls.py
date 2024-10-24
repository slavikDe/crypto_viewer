from django.urls import path
from coins import views

app_name = 'coins'

urlpatterns = [
    path('BTC/', views.coin, name='coin'),


]
