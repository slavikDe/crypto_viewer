from django.core.paginator import Paginator
from django.shortcuts import render

from coins.models import Coins


# Create your views here.]
def coin_list(request):
    page = request.GET.get('page', 1)

    coins = Coins.objects.all()

    paginator = Paginator(coins, 2)
    current_page = paginator.page(page)

    context = {
        'title': 'Coins',
        'coins': current_page,
    }

    return render(request, 'main/coins_list.html', context)

def home(request):
    context = {
        'content' : 'Home page'
    }
    return render(request, 'main/home.html', context)

