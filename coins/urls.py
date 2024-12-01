from django.urls import path
from coins import views

app_name = 'coins'

urlpatterns = [
    path('api/historical_price', views.get_historical_price, name='get_historical_price'),
    # path('edit_delete_coin/', views.edit_delete_coin, name='edit_delete_coin'),
    # path('handle-form/', views.handle_form, name='handle_form'),
    path('update-coin/', views.update_coin, name='update_coin'),
    path('delete-coin/', views.delete_coin, name='delete_coin'),

    path('<slug:coin_slug>/', views.coin, name='coin'),

]
