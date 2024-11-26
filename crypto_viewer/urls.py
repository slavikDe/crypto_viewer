"""
URL configuration for crypto_viewer project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from crypto_viewer import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls', namespace='main')),
    path('coins/', include('coinList.urls', namespace='coinList')),
    path('coin/', include('coins.urls', namespace='coins')),
    path('user/', include('users.urls', namespace='user')),

]

if settings.DEBUG:
    # urlpatterns += [path("__debug__/", include("debug_toolbar.urls")),
    #                 ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#   main: (home.html, base.html)
# host:port                    main:home ((greetings page/login suggest))

#   coinList: (coin_list.html)
# host:port/coins              main:coin_list (list of coins)
# host:port/coins/?page=2      main:coin_list (list of coins + pagination)
# host:port/coins/?<filters>   main:coin_list (list of coins + filters)
# host:port/coins/search       main:coin_list (list of coins after search)

#   coin: (coin.html)
# host:port/coins/<coinName>   coins:coin (host:port/coins/BTC)

#   user: (profile.html, login.html==dialog, registration.html==dialog)
# host:port/user/login
# host:port/user/signup
# host:port/user/profile

# host:port/admin/













