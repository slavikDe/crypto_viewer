from django.urls import path
from coins import views

app_name = 'coins'

urlpatterns = [
    path('<slug:coin_slug>/', views.coin, name='coin'),
]
