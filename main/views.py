from django.shortcuts import render


def index(request):
    context = {
        'content': 'Home page'
    }
    return render(request, 'main/home.html', context)
