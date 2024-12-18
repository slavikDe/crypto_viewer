from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError

from users.models import Users


class UserLoginForm(AuthenticationForm):
    username = forms.CharField()
    password = forms.CharField()

    class Meta:
        model = Users
        fields = ['username', 'password']


class UserRegistrationForm(UserCreationForm):
    class Meta:
        model = Users
        fields = ['email', 'username', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if Users.objects.filter(email=email).exists():
            raise ValidationError("Ця електронна адреса вже використовується.")
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if Users.objects.filter(username=username).exists():
            raise ValidationError("Це ім'я користувача вже зайнято.")
        return username


class ProfileForm(UserChangeForm):
    class Meta:
        model = Users
        fields = ('image', 'username', 'email')

        image = forms.ImageField(required=False)
        username = forms.CharField()
        email = forms.CharField()


