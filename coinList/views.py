from django.core.paginator import Paginator
from django.shortcuts import render
from coins.models import Coins
from main.utils import q_search
from django.http import JsonResponse

def coin_list(request):

    # search
    query = request.GET.get('q', None)

    # pagination
    page = request.GET.get('page', 1)

    if query:
        coins = q_search(query)
    else:
        coins = Coins.objects.all()

    paginator = Paginator(coins, 10)
    current_page = paginator.page(page)

    context = {
        'title': 'Coins',
        'coins': current_page,
    }

    return render(request, 'coinList/coins_list.html', context)



