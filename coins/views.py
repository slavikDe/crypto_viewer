from django.shortcuts import render

# Create your views here.

def coin(request):


    return render(request, 'coins/coin.html')
