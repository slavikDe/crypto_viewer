from django.contrib.postgres.search import SearchVector, SearchRank, SearchQuery

from coins.models import Coins
from django.db.models import Q


def q_search(query):

    #  bad with filtering
    # vector = SearchVector('name', 'symbol')
    # query = SearchQuery(query)
    #
    # return  Coins.objects.annotate(rank=SearchRank(vector, query)).filter(rank__gt=0).order_by('-rank')

    keywords = [word for word in query.split()]
    q_object = Q()

    for token in keywords:
        q_object |= Q(name__icontains=token)
        q_object |= Q(slug__icontains=token)

    return Coins.objects.filter(q_object)