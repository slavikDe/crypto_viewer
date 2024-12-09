import json
import os
import uuid
from warnings import catch_warnings
from zipfile import error

from django.contrib import messages
from importlib.metadata import files

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.shortcuts import render, redirect
from django.http import JsonResponse, Http404, HttpResponseRedirect
import requests
from django.template.defaulttags import csrf_token
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from coins.forms import CoinForm
from coins.models import Coins, Market
from coinList.views import make_request
from users.forms import ProfileForm


def coin(request, coin_slug):
    exchange = request.GET.get('exchange')

    user = request.user
    print("here")

    # Check in user's custom coins
    custom_coin = None
    is_custom = False
    if user.is_authenticated and user.user_custom_pair:
        custom_coins = json.loads(user.user_custom_pair)
        custom_coin = next((coin for coin in custom_coins if coin["slug"] == coin_slug), None)
        if custom_coin:
            is_custom = True  # Mark as custom coin

    # Fetch coin information
    try:
        market = Market.objects.get(name=exchange)
    except Market.DoesNotExist:
        raise Http404("Coin not found")

    endpoint = '/api/v3/ticker/24hr'

    print("endpoint: ", endpoint)
    if is_custom:
        coin = custom_coin
        coin_info = make_request(market.base_url + endpoint, param={'symbol': coin['symbol'].upper() + 'USDT'})
        print("custom coin path: :", coin['image'])
    else:
        try:
            coin = Coins.objects.get(slug=coin_slug)
            coin_info = make_request(market.base_url + endpoint, param={'symbol': coin.symbol.upper() + 'USDT'})
        except Coins.DoesNotExist:
            raise Http404("Coin not found")

    # Determine if the user is an admin
    is_admin_user = user.is_authenticated and user.is_superuser
    # print("image path: ", c)
    # Context for the template
    context = {
        'coin': coin,  # Coin data (custom or default)
        'coin_info': coin_info,  # Market data
        'is_custom': is_custom,  # Is this a custom coin?
        'is_admin_user': is_admin_user,  # Is the user an admin?
    }
    return render(request, 'coins/coin.html', context)
def get_historical_price(request):
    # Mexc API URL
    symbol = request.GET.get('symbol')
    interval = request.GET.get('interval')

    url = f'https://api.mexc.com/api/v3/klines?symbol={symbol}&interval={interval}'
    try:
        # Fetch data from Mexc API
        response = requests.get(url, headers={
            "accept": "application/json",
        })
        response.raise_for_status()

        # Return the data as a JSON response to the frontend
        return JsonResponse(response.json(), safe=False)

    except requests.exceptions.RequestException as e:
        # Handle any request errors
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def update_coin(request):
    if request.method == "POST":
        name = request.POST.get('name')
        symbol = request.POST.get('symbol')
        image = request.FILES.get('image')
        is_custom = request.POST.get('is_custom') == 'true'
        print("is_custom: ", request.POST.get('is_custom'))
        user = request.user

        try:
            if is_custom:
                custom_coins = json.loads(user.user_custom_pair or '[]')
                coin = next((coin_ for coin_ in custom_coins if coin_["symbol"] == symbol), None)

                if not coin:
                    return JsonResponse({"success": False, 'message': "Custom coin not found"})

                coin['name'] = name
                if image:
                    delete_image(coin.get('image'))

                    ext = image.name.split('.')[-1]
                    filename = f"{uuid.uuid4()}.{ext}"
                    custom_logo_path = os.path.join('customCoinLogo', filename)

                    path = default_storage.save(custom_logo_path, ContentFile(image.read()))
                    coin['image'] = os.path.join('media', path)

                user.user_custom_pair = json.dumps(custom_coins)
                user.save()

                # print(f"Custom coin updated: {symbol}")
                return JsonResponse({'success': True, 'message': 'Custom coin updated successfully!', 'redirect_url': reverse('coins:coin', kwargs={'coin_slug': symbol})})

            else:
                coin = Coins.objects.get(symbol=symbol)
                print("coin: ", coin)
                if not coin:
                    return JsonResponse({'success': False, 'message': 'Default coin not found.'})

                coin.name = name
                if image:
                    delete_image(coin.image.path if coin.image else None)

                    ext = image.name.split('.')[-1]
                    filename = f"{uuid.uuid4()}.{ext}"
                    default_logo_path = os.path.join('customCoinLogo', filename)
                    saved_path = default_storage.save(default_logo_path, ContentFile(image.read()))
                    coin.image = os.path.join('media', saved_path)

                coin.save()

                # print(f"Default coin updated: {symbol}")
                return JsonResponse({'success': True, 'message': 'Default coin updated successfully!', 'redirect_url': reverse('coins:coin', kwargs={'coin_slug': symbol})})

        except Coins.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Coin not found.'})
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method.'})

def delete_coin(request):
    if request.method == "POST":
        symbol = request.POST.get('symbol')
        is_custom = request.POST.get('is_custom') == 'true'
        user = request.user

        try:
            if is_custom:
                custom_coins = json.loads(user.user_custom_pair or '[]')
                coin = next((coin_ for coin_ in custom_coins if coin_["symbol"] == symbol), None)

                if not coin:
                    return JsonResponse({"success": False, 'message': "Custom coin not found"})

                delete_image(coin.get('image'))

                custom_coins = [coin_ for coin_ in custom_coins if coin_["symbol"] != symbol]
                user.user_custom_pair = json.dumps(custom_coins)
                user.save()

                # print(f"Custom coin deleted: {symbol}")
                return JsonResponse({'success': True, 'redirect_url': reverse('coinList:index')})

            else:
                coin = Coins.objects.get(symbol=symbol)
                if not coin:
                    return JsonResponse({'success': False, 'redirect_url': reverse('coinList:index')})

                delete_image(coin.image.path if coin.image else None)

                coin.delete()

                # print(f"Default coin deleted: {symbol}")
                return JsonResponse({'success': True, 'redirect_url': reverse('coinList:index')})

        except Coins.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Coin not found.'})
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method.'})


@csrf_exempt
def delete_image(image_path):
    """
    Видаляє зображення, якщо воно існує в файловій системі.
    """
    if image_path:
        image_path = image_path.replace('media/', '')
        if default_storage.exists(image_path):
            default_storage.delete(image_path)
            # print(f"Image deleted: {image_path}")