from django.core.paginator import Paginator
from django.http import HttpResponseRedirect, Http404
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse

import requests
import os

from coins.models import Coins
from crypto_viewer.settings import BASE_DIR
from main.utils import q_search

def coin_list(request):
    # search
    query = request.GET.get('q', None)

    MEXC_base_url = 'https://api.mexc.com'
    endpoint = '/api/v3/ticker/24hr'

    coins_changes = [{
        'symbol': coin['symbol'][:-4].lower(),
        'change': round(float(coin['priceChangePercent']) * 100, 3),
        'price' : round(float(coin['prevClosePrice']) * 100, 3),
        'volume' : round(float(coin['volume']) * 100, 3),
        } for coin in make_request(MEXC_base_url + endpoint)]


    coins_changes_dict = {coin['symbol']: coin for coin in coins_changes}

    if query:
        coins_ = q_search(query)
    else:
        coins_ = Coins.objects.order_by('id')

    coins = []
    for coin in coins_:
        change_data = coins_changes_dict.get(coin.symbol.lower(), None)
        coin_data = {
            'id': coin.id,
            'symbol': coin.symbol,
            'slug': coin.slug,
            'name': coin.name,
            'image': coin.image,
            'change': change_data['change'] if change_data else 0,
            'price':  change_data['price']  if change_data else 0,
            'volume': change_data['volume'] if change_data else 0,
        }
        coins.append(coin_data)

    context = {
        'title': 'Coins',
        'coins': coins,
    }

    return render(request, 'coinList/coins_list.html', context)


def add_coin(request):
    coin_id = request.GET.get('name', None)
    if not coin_id:
        raise Http404("Page not found")

    folder = os.path.join(BASE_DIR, 'media/media/coinLogo')

    # Fetch coin data from CoinGecko API
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        image_url = data['image']['small']  # Choose from 'thumb', 'small', or 'large'

        # Make the folder if it doesn't exist
        if not os.path.exists(folder):
            os.makedirs(folder)

        # Download the image
        image_response = requests.get(image_url)
        if image_response.status_code == 200:
            # Save the image with the coin symbol as the file name
            image_path = os.path.join(folder, f"{coin_id.lower()}.png")
            with open(image_path, 'wb') as file:
                file.write(image_response.content)

    return HttpResponseRedirect(reverse('coinList:index'))

def get_all_coins(request):
    coins = list(Coins.objects.values_list('symbol', flat=True))
    return JsonResponse({'coins': coins}, safe=False)

def make_request(url, param=None):
    response = requests.get(url, params=param)
    result = response.json()
    return result

#