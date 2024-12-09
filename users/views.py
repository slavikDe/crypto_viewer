import uuid

from django.contrib import auth, messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from users.forms import UserLoginForm, UserRegistrationForm, ProfileForm, TemporaryRegistration

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


# def registration(request):
#     if request.method == 'POST':
#         form = UserRegistrationForm(data=request.POST)
#         if form.is_valid():
#             form.save()
#             user = form.instance
#             auth.login(request, user)
#             messages.success(request, f'{user.username}, You are now registered')
#             return HttpResponseRedirect(reverse('main:home'))
#     else:
#         form = UserRegistrationForm()
#
#     context = {
#         'form': form
#     }
#
#     return render(request, 'users/registration.html', context)

def registration(request):
    if request.method == 'POST':
        logger.info("POST запит отримано.")
        form = UserRegistrationForm(data=request.POST)
        if form.is_valid():
            logger.info("Форма валідна.")
            email = form.cleaned_data['email']
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']

            verification_code = uuid.uuid4()
            logger.info(f"Сгенеровано код верифікації: {verification_code}")

            TemporaryRegistration.objects.create(
                email=email,
                username=username,
                password=password,
                verification_code=verification_code,
            )

            verification_url = request.build_absolute_uri(
                reverse('users:verify_email', kwargs={'verification_code': verification_code})
            )
            logger.info(f"URL для підтвердження: {verification_url}")

            send_mail(
                'Verify your email',
                f'Please verify your email by clicking the link: {verification_url}',
                'S.denyssenko@gmail.com',
                [email],
                fail_silently=False,
            )
            logger.info("Лист успішно надіслано.")

            messages.success(request, 'A verification email has been sent. Check your inbox.')
            return redirect('users:login')
        else:
            logger.warning("Форма не валідна.")
            logger.warning(form.errors)
    else:
        form = UserRegistrationForm()
        logger.info("GET запит отримано. Повертаємо форму реєстрації.")

    return render(request, 'users/registration.html', {'form': form})


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
def verify_email(request, verification_code):
    temp_registration = get_object_or_404(TemporaryRegistration, verification_code=verification_code)

    user = User.objects.create_user(
        username=temp_registration.username,
        email=temp_registration.email,
        password=temp_registration.password,
    )
    user.email_verified = True
    user.save()

    temp_registration.delete()

    messages.success(request, 'Your email has been verified, and your account is now active.')
    return redirect('users:login')
