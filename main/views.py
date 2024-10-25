from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.]
def coin_list(request):
    context = {
        'title': 'Coins',
        'coins': [
            {'image': 'deps/images/coinLogo/eth.png',
             'name': 'Ethereum',
             'symbol': 'ETH',
             'change': '-2%',
             'price': '54,232.11',
             'volume': 28.000,
             'cap': 1_323.342},

            {'image': 'deps/images/coinLogo/aleo.jpeg',
             'name': 'Aloe',
             'price': '54,232.11',
             'symbol': 'Aleo',
             'change': '+2%',
             'volume': 211.000,
             'cap': 23.342},

            {'image': 'deps/images/coinLogo/Untitled.png',
             'price': '54,232.11',
             'name': 'Bitcoin',
             'symbol': 'BTC',
             'change': '+0.23%',
             'volume': 12.300,
             'cap': 12_523.342},

            {'image': '',
             'name': 'Litecoin',
             'symbol': 'LTC',
             'change': '-1.8%',
             'price': '182.22',
             'volume': 55.230,
             'cap': 3_422.123},

            {'image': '',
             'name': 'Ripple',
             'symbol': 'XRP',
             'change': '+3.1%',
             'price': '1.12',
             'volume': 482.900,
             'cap': 8_923.512},

            {'image': '',
             'name': 'Polkadot',
             'symbol': 'DOT',
             'change': '+0.5%',
             'price': '7.45',
             'volume': 102.300,
             'cap': 6_342.231},

            {'image': '',
             'name': 'Cardano',
             'symbol': 'ADA',
             'change': '-0.7%',
             'price': '0.45',
             'volume': 512.100,
             'cap': 2_145.902}
        ]
    }

    return render(request, 'main/coins_list.html', context)

def home(request):
    context = {
        'content' : 'Home page'
    }
    return render(request, 'main/home.html', context)

