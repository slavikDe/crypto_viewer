from django.urls import path
from main import views

app_name = 'main'

urlpatterns = [

    path('', views.coin_list, name='index'),
    path('home/', views.home, name='home'),
]
