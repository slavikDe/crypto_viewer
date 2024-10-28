from coins.models import Coins
from django.db.models import Q


def q_search(query):
    # for search by id
    # if query.isdigit() and len(query) <= 5:
    #     return Coins.objects.filter(id=int(query))

    keywords = [word for word in query.split()]

    q_objects = Q()

    for token in keywords:
        q_objects |= Q(name__icontains=token) | Q(symbol__icontains=token)

    return Coins.objects.filter(q_objects)
