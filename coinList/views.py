from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from coins.models import Coins, Market
from main.utils import q_search

import json
import requests
import os

def coin_list(request):
    user = request.user

    if user.is_authenticated and user.favorite_coins_id:
        if isinstance(user.favorite_coins_id, str):
            favorite_coins = json.loads(user.favorite_coins_id)
        else:
            favorite_coins = user.favorite_coins_id
    else:
        favorite_coins = []

    print("Favorite coins:", favorite_coins)

    exchange = request.GET.get('exchange')

    query = request.GET.get('q', None)

    MEXC_base_url = 'https://api.mexc.com'
    endpoint = '/api/v3/ticker/24hr'

    coins_changes = [{
        'symbol': coin['symbol'][:-4].lower(),
        'change': round(float(coin['priceChangePercent']), 3),
        'price': round(float(coin['prevClosePrice']), 3),
        'volume': round(float(coin['volume']), 3),
    } for coin in make_request(MEXC_base_url + endpoint)]

    coins_changes_dict = {coin['symbol']: coin for coin in coins_changes}

    custom_coins = []
    if user.is_authenticated and user.user_custom_pair:
        if isinstance(user.user_custom_pair, str):
            custom_coins = json.loads(user.user_custom_pair)
        else:
            custom_coins = user.user_custom_pair

    for coin in custom_coins:
        coin['isCustom'] = True

    if query:
        default_coins = [
            {
                'id': coin.id,
                'symbol': coin.symbol,
                'slug': coin.slug,
                'name': coin.name,
                'image': coin.image.url[7:] if coin.image else None,
                'isCustom': False,
            } for coin in q_search(query)
        ]

        if custom_coins:
            custom_coins = [
                coin for coin in custom_coins
                if query.lower() in coin['symbol'].lower() or query.lower() in coin['name'].lower()
            ]
    else:
        default_coins = [
            {
                'id': coin.id,
                'symbol': coin.symbol,
                'slug': coin.slug,
                'name': coin.name,
                'image': coin.image.url[7:] if coin.image else None,
                'isCustom': False,
            } for coin in Coins.objects.order_by('id')
        ]

    coins_ = custom_coins + default_coins
    print("customs: ", custom_coins)
    coins = []
    for coin in coins_:
        symbol_key = coin['symbol'].lower()
        change_data = coins_changes_dict.get(symbol_key, None)

        coin_data = {
            'id': coin.get('id', None),
            'symbol': coin['symbol'],
            'slug': coin.get('slug', ''),
            'name': coin['name'],
            'image': coin['image'],
            'isCustom': coin.get('isCustom', False),
            'isFavorite': coin['symbol'] in favorite_coins,
            'change': change_data['change'] if change_data else 0,
            'price': change_data['price'] if change_data else 0,
            'volume': change_data['volume'] if change_data else 0,
        }
        coins.append(coin_data)

    coins.sort(key=lambda x: not x['isFavorite'])

    context = {
        'title': 'Coins',
        'coins': coins,
        'exchange': exchange,
    }

    return render(request, 'coinList/coins_list.html', context)


def add_coin_image(symbol_name):
    coin_id = symbol_name

    folder = 'media/custom_coins/coinLogo_/'
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}'
    response = requests.get(url)
    print("add image status: ", response)
    print("url: ", url)
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
            print("add ingage image path written: ", image_path)
            return image_path
    return None

def get_all_coins(request):
    print("in get_all_coins")
    exchange = request.GET.get('exchange', None)

    market_data = None

    if exchange:
        try:
            market = Market.objects.get(name=exchange)
            market_data = {
                'name': market.name,
                'base_url': market.base_url,
                'ws_url': market.ws_url,
            }
            print('name ', market.name,
                ' base_url ', market.base_url,
                ' ws_url ', market.ws_url)
        except Market.DoesNotExist:
            return JsonResponse({'error': f'Market "{exchange}" not found.'}, status=404)
    else:
        market = None

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
    print('coins ', all_coins, ' exchange ' , market_data)
    return JsonResponse({'coins': all_coins, 'exchange' : market_data}, safe=False)
    # return JsonResponse({'coins': all_coins}, safe=False)

def make_request(url, param=None):
    print("make_request: ", url, " , params: ", param)
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
            symbol = data.get('symbol', '').strip().lower()[:-4]
            name = data.get('name', '').strip()
            market_names = data.get('market', [])
            print("symbol market: ", symbol, market_names)

            if not symbol or not market_names:
                print("symbol bad")
                return JsonResponse({'error': 'Symbol and at least one market are required'}, status=400)

            if Coins.objects.filter(symbol=symbol).exists():
                return JsonResponse({'error': 'Coin already exists in the global list.'}, status=400)

            image_path = add_coin_image(name)
            print("addDefaultCoin imgPath: ", image_path)

            coin = Coins.objects.create(
                symbol=symbol,
                slug=symbol,
                name=name,
                image=image_path,
                market_id=Market.objects.get(name=market_names).id,
            )

            markets = Market.objects.filter(name=market_names)
            print('markets: ', markets)
            if not markets:
                return JsonResponse({'error': 'One or more specified markets do not exist.'}, status=400)

            coin.markets.set(markets)
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


@login_required
def toggle_favorite_coin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        coin_id = data.get('coin_id')

        if not coin_id:
            return JsonResponse({'error': 'Coin ID is required'}, status=400)

        user = request.user
        favorite_coins = user.favorite_coins_id or []

        if coin_id in favorite_coins:
            favorite_coins.remove(coin_id)
            action = 'removed'
        else:
            favorite_coins.append(coin_id)
            action = 'added'

        user.favorite_coins_id = favorite_coins
        user.save()

        return JsonResponse({'message': f'Coin {coin_id} has been {action}.', 'favorite_coins': favorite_coins})

    return JsonResponse({'error': 'Invalid request method'}, status=405)