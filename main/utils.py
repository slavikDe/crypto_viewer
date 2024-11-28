from django.contrib.postgres.search import SearchVector, SearchRank, SearchQuery

from coins.models import Coins
from django.db.models import Q
from django.contrib.postgres.indexes import GinIndex

class Meta:
    indexes = [
       GinIndex(fields=["symbol"]),
    ]


def q_search(query):
    if not query:
        print("Empty query")
        return Coins.objects.none()

    vector = SearchVector('symbol', weight='A') + SearchVector('name', weight='B') + SearchVector('slug', weight='C')
    search_query = SearchQuery(query)

    results = Coins.objects.annotate(rank=SearchRank(vector, search_query)) \
        .filter(rank__gt=0) \
        .order_by('-rank')

    print(f"Search results for query '{query}': {results}")
    return results


