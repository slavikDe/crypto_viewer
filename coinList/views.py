from django.core.paginator import Paginator
from django.shortcuts import render
from coins.models import Coins
from main.utils import q_search


def coin_list(request):
    # filtering
    order_by_price = request.GET.get('order_by_price', None)
    order_by_volume = request.GET.get('order_by_volume', None)
    order_by_name = request.GET.get('order_by_name', None)
    # search
    query = request.GET.get('q', None)

    # pagination
    page = request.GET.get('page', 1)

    if query:
        coins = q_search(query)
    else:
        coins = Coins.objects.all()

    if order_by_price and order_by_price != "default":
        coins = coins.order_by(order_by_price)

    if order_by_volume and order_by_volume != "default":
        coins = coins.order_by(order_by_volume)

    if order_by_name:
        coins = coins.order_by(order_by_name)

    paginator = Paginator(coins, 10)
    current_page = paginator.page(page)

    context = {
        'title': 'Coins',
        'coins': current_page,
    }

    return render(request, 'coinList/coins_list.html', context)

