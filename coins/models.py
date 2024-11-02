from django.db import models

class Coins(models.Model):
    symbol = models.CharField(max_length=10, unique=True, verbose_name="Symbol", blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name")
    image = models.ImageField(upload_to='media/coinIcons', blank=True, null=True, verbose_name='image')
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL", blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"

    class Meta:
        db_table = 'coins'
        verbose_name = 'coin'
        verbose_name_plural = 'coins'
        ordering = ('symbol',)


class Market(models.Model):
    name = models.CharField(max_length=100, verbose_name="Name", blank=True, null=True)
    coins = models.ManyToManyField(Coins)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'markets'
        verbose_name = 'market'
        verbose_name_plural = 'markets'



# CREATE TABLE "coins" (
#   "id" integer UNIQUE PRIMARY KEY NOT NULL,
#   "coin_symbol" varchar UNIQUE NOT NULL,
#   "coin_name" varchar UNIQUE NOT NULL,
#   "coin_image_path" varchar
# );
#
# CREATE TABLE "coins_users" (
#   "coin_id" integer,
#   "user_id" integer
# );
#
# CREATE TABLE "users" (
#   "id" integer UNIQUE PRIMARY KEY NOT NULL,
#   "username" varchar UNIQUE,
#   "first_name" varchar,
#   "surname" varchar,
#   "email" varchar UNIQUE NOT NULL,
#   "password" varchar NOT NULL,
#   "password2" varchar NOT NULL,
#   "user_custom_pair" TEXT,
#   "user_avatar_svg" TEXT
# );
#
# CREATE TABLE "markets" (
#   "id" integer UNIQUE PRIMARY KEY NOT NULL,
#   "name" varchar UNIQUE NOT NULL
# );
#
# CREATE TABLE "markets_coins" (
#   "coin_id" integer NOT NULL,
#   "market_id" integer NOT NULL
# );
#
# ALTER TABLE "coins_users" ADD FOREIGN KEY ("coin_id") REFERENCES "coins" ("id");
#
# ALTER TABLE "coins_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
#
# ALTER TABLE "markets_coins" ADD FOREIGN KEY ("coin_id") REFERENCES "coins" ("id");
#
# ALTER TABLE "markets_coins" ADD FOREIGN KEY ("market_id") REFERENCES "markets" ("id");