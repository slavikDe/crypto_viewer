from django import forms

from coins.models import Coins

class CoinForm(forms.ModelForm):
    class Meta:
        model = Coins
        fields = ('symbol', 'name', 'image')

        symbol = forms.CharField()
        name = forms.CharField()
        image = forms.ImageField(required=False)
