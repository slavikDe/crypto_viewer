import json

from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import HttpResponseRedirect, Http404
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse
from django.conf import settings

import requests
import os

from django.views.decorators.csrf import csrf_exempt

from coins.models import Coins
from crypto_viewer.settings import BASE_DIR
from main.utils import q_search

def coin_list(request):
    # Search
    query = request.GET.get('q', None)

    # API for market data
    MEXC_base_url = 'https://api.mexc.com'
    endpoint = '/api/v3/ticker/24hr'

    # Fetch market data
    coins_changes = [{
        'symbol': coin['symbol'][:-4].lower(),
        'change': round(float(coin['priceChangePercent']), 3),
        'price': round(float(coin['prevClosePrice']), 3),
        'volume': round(float(coin['volume']), 3),
    } for coin in make_request(MEXC_base_url + endpoint)]

    coins_changes_dict = {coin['symbol']: coin for coin in coins_changes}

    # Add custom coins for the current user
    user = request.user
    custom_coins = []

    if user.is_authenticated and user.user_custom_pair:
        custom_coins = json.loads(user.user_custom_pair)

    # Add custom coins field `isCustom` = True
    for coin in custom_coins:
        coin['isCustom'] = True
        # coin['image'] = coin.image
        # coin['image'] = f"custom_coins/coinLogo_/{coin['symbol']}.png"  # Correct image path for custom coins

    # Fetch default coins
    if query:
        # Search default coins
        default_coins = [
            {
                'id': coin.id,
                'symbol': coin.symbol,
                'slug': coin.slug,
                'name': coin.name,
                'image': coin.image.url[7:] if coin.image else None,
                'isCustom': False,  # Default coins are not custom
            } for coin in q_search(query)
        ]

        # Search within custom coins
        if custom_coins:
            custom_coins = [
                coin for coin in custom_coins if query.lower() in coin['symbol'].lower() or query.lower() in coin['name'].lower()
            ]
    else:
        # Get all default coins
        default_coins = [
            {
                'id': coin.id,
                'symbol': coin.symbol,
                'slug': coin.slug,
                'name': coin.name,
                'image': coin.image.url[7:] if coin.image else None,
                'isCustom': False,  # Default coins are not custom
            } for coin in Coins.objects.order_by('id')
        ]

    # Combine custom coins with default coins (custom coins come first)
    coins_ = custom_coins + default_coins

    # Enrich data with API data
    coins = []
    for coin in coins_:
        symbol_key = coin['symbol'].lower()  # Normalize case for API lookup
        change_data = coins_changes_dict.get(symbol_key, None)

        coin_data = {
            'id': coin.get('id', None),  # ID may be missing for custom coins
            'symbol': coin['symbol'],
            'slug': coin.get('slug', ''),  # Custom coins may not have a slug
            'name': coin['name'],
            'image': coin['image'],
            'isCustom': coin.get('isCustom', False),  # True for custom coins, False for default coins
            'change': change_data['change'] if change_data else 0,
            'price': change_data['price'] if change_data else 0,
            'volume': change_data['volume'] if change_data else 0,
        }
        coins.append(coin_data)

    # Context for template rendering
    context = {
        'title': 'Coins',
        'coins': coins,
    }

    return render(request, 'coinList/coins_list.html', context)

def add_coin_image(symbol_name):
    coin_id = symbol_name

    folder = 'media/custom_coins/coinLogo_/'
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        image_url = data['image']['small']

        if not os.path.exists(folder):
            os.makedirs(folder)

        image_response = requests.get(image_url)
        if image_response.status_code == 200:
            image_path = os.path.join(folder, f"{symbol_name.lower()}.png")
            with open(image_path, 'wb') as file:
                file.write(image_response.content)
            return image_path
    return None

def get_all_coins(request):
    default_coins = list(Coins.objects.values_list('symbol', flat=True))

    user = request.user

    custom_coins = []

    if user.is_authenticated and user.user_custom_pair:
        try:
            custom_coin_data = json.loads(user.user_custom_pair)
            custom_coins = [coin['symbol'] for coin in custom_coin_data]
        except json.JSONDecodeError:
            custom_coins = []

    all_coins = default_coins + custom_coins

    return JsonResponse({'coins': all_coins}, safe=False)

def make_request(url, param=None):
    response = requests.get(url, params=param)
    result = response.json()
    return result

@csrf_exempt
def test_coin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            symbol = data.get('symbol', '').upper()
            market = data.get('market', '')

            if not symbol or not market:
                return JsonResponse({'error': 'Both symbol and market fields are required.'}, status=400)


            return JsonResponse({'message': 'Symbol is valid.'}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'This endpoint only accepts POST requests.'}, status=405)


@csrf_exempt
@login_required
def add_default_coin(request):
    if request.method == 'POST':
        try:
            # Parse the request data
            data = json.loads(request.body)
            symbol = data.get('symbol', '')[:-4].lower()
            market = data.get('market', '')
            name = data.get('name', '')

            if not symbol or not market:
                return JsonResponse({'error': 'Symbol and market are required'}, status=400)

            if Coins.objects.filter(symbol=symbol.lower()).exists():
                return JsonResponse({'error': 'Coin already exists in the global list.'}, status=400)

            # Add image for default coin
            image_path = add_coin_image(name)
            print("addDefaultCoin imgPath: ", image_path)

            # Add coin to the global database
            Coins.objects.create(
                symbol=symbol,
                slug=symbol,
                name=name,
                market=market,
                image=image_path,
            )
            return JsonResponse({'message': 'Default coin added successfully!'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
@login_required
def add_custom_coin(request):
    if request.method == 'POST':
        try:
            # Parse the request data
            data = json.loads(request.body)
            symbol = data.get('symbol', '')[:-4].lower()
            market = data.get('market', '')
            name = data.get('name', '')

            if not symbol or not market:
                return JsonResponse({'error': 'Symbol and market are required'}, status=400)

            # Add image for custom coin
            image_path = add_coin_image(name)
            print("imagePath from custom adding 2 : ", image_path)
            coin_to_save = {
                "symbol": symbol,
                "name": name,
                "image": image_path,
                "slug": symbol,
                "market": market,
            }

            # Add to the user's custom coins
            user = request.user
            if user.is_authenticated and is_coin_in_custom_pair(user, symbol):
                return JsonResponse({'error': 'Coin already exists in your custom pairs.'}, status=400)

            print("in defaults coins search: ", symbol.lower())
            if Coins.objects.filter(symbol=symbol.lower()).exists():

                return JsonResponse({'error': 'Coin already exists in the global list.'}, status=400)

            existing_pairs = json.loads(user.user_custom_pair) if user.user_custom_pair else []
            existing_pairs.append(coin_to_save)
            user.user_custom_pair = json.dumps(existing_pairs)
            user.save()

            return JsonResponse({'message': 'Custom coin added successfully!'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

def is_coin_in_custom_pair(user, symbol):
    """
     Check if a given symbol exists in the user's custom pair list.

     Args:
         user (User): The user whose custom pairs to check.
         symbol (str): The symbol to search for.

     Returns:
         bool: True if the symbol exists, otherwise False.
     """
    if not user.is_authenticated or not hasattr(user, 'user_custom_pair'):
        return False

    symbol = symbol.upper()  # Normalize symbol to uppercase

    try:
        custom_pairs = json.loads(user.user_custom_pair) if user.user_custom_pair else []
    except json.JSONDecodeError:
        return False

    return any(coin.get('symbol', '').upper() == symbol for coin in custom_pairs)