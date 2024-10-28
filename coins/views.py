from django.shortcuts import render

from coins.models import Coins


# Create your views here.

def coin(request, coin_slug):
    coin = Coins.objects.get(slug=coin_slug)

    context = {
        'coin': coin,
    }

    return render(request, 'coins/coin.html', context)

