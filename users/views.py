from django.contrib import auth, messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from users.forms import UserLoginForm, UserRegistrationForm, ProfileForm

import logging

logger = logging.getLogger(__name__)

def login(request):
    if request.method == 'POST':
        form = UserLoginForm(data=request.POST)
        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']
            user = auth.authenticate(username=username, password=password)
            if user:
                auth.login(request, user)
                messages.success(request, f'{username}, You are now logged in')

                if request.POST.get('next', None):
                    return HttpResponseRedirect(request.POST.get('next'))

                return HttpResponseRedirect(reverse('coinList:index'))
    else:
        form = UserLoginForm()

    context = {
        'form': form
    }

    return render(request, 'users/login.html', context)


def registration(request):
    if request.method == 'POST':
        form = UserRegistrationForm(data=request.POST)
        if form.is_valid():
            form.save()
            user = form.instance
            auth.login(request, user)
            messages.success(request, f'{user.username}, You are now registered')
            return HttpResponseRedirect(reverse('user:login'))
    else:
        form = UserRegistrationForm()

    context = {
        'form': form
    }

    return render(request, 'users/registration.html', context)

@login_required
def profile(request):
    if request.method == 'POST':
        form = ProfileForm(data=request.POST, instance=request.user, files=request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, f'Profile updated successfully')
            return HttpResponseRedirect(reverse('user:profile'))
    else:
        form = ProfileForm(instance=request.user)

    context = {
        'form': form
    }
    return render(request, 'users/profile.html', context)


@login_required
def logout(request):

    auth.logout(request)
    messages.success(request, f'You have been logged out')
    return redirect(reverse('coinList:index'))

User = get_user_model()


@login_required
def delete_account(request):
    print("in delete account")
    if request.method == "POST":
        user = request.user
        user.delete()
        return JsonResponse({"success": True, "message": "Account deleted successfully."})
    return JsonResponse({"success": False, "message": "Invalid request method."}, status=400)