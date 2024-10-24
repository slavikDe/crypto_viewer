from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.]
def coin_list(request):

    return render(request, 'main/coins_list.html')

def home(request):
    context = {
        'content' : 'Home page'
    }
    return render(request, 'main/home.html', context)

