from django.shortcuts import render
from django.http import JsonResponse
import requests

from coins.models import Coins
from coinList.views import make_request

def coin(request, coin_slug):
    coin = Coins.objects.get(slug=coin_slug)

    MEXC_base_url = 'https://api.mexc.com'
    endpoint = '/api/v3/ticker/24hr'
    coin_info =  make_request(MEXC_base_url + endpoint, param={'symbol':coin.symbol.upper() + 'USDT'})
    context = {
        'coin': coin,
        'coin_info': coin_info
    }
    return render(request, 'coins/coin.html', context)


def test(request):
    return render(request, 'coins/test_chart.html')


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