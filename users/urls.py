from django.urls import path
from users  import views

app_name = 'users'

urlpatterns = [

    path('login/', views.login, name='login'),
    path('registration/', views.registration, name='registration'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout, name='logout'),
    path('delete-account/', views.delete_account, name='delete-account'),
    # path('verify/<uuid:verification_code>/', views.verify_email, name='verify_email'),

]

