# Generated by Django 4.2.16 on 2024-12-06 12:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coins', '0004_coins_market_delete_market'),
    ]

    operations = [
        migrations.CreateModel(
            name='Market',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=100, null=True, verbose_name='Name')),
                ('ws_url', models.CharField(blank=True, max_length=100, null=True, verbose_name='WS URL')),
                ('base_url', models.CharField(blank=True, max_length=100, null=True, verbose_name='Base URL')),
            ],
            options={
                'verbose_name': 'market',
                'verbose_name_plural': 'markets',
                'db_table': 'markets',
            },
        ),
        migrations.RemoveField(
            model_name='coins',
            name='market',
        ),
        migrations.AddField(
            model_name='coins',
            name='market_id',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Market ID'),
        ),
    ]