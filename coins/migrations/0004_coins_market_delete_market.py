# Generated by Django 4.2.16 on 2024-11-26 18:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coins', '0003_alter_coins_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='coins',
            name='market',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Market'),
        ),
        migrations.DeleteModel(
            name='Market',
        ),
    ]
