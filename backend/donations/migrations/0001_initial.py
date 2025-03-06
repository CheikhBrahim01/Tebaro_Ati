# Generated by Django 5.0 on 2025-03-05 23:32

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LogEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('signature', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('target_amount', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('collected_amount', models.PositiveIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_validated', models.BooleanField(default=False)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='project_photos/')),
                ('is_closed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone_number', models.CharField(blank=True, max_length=20, null=True)),
                ('transaction_type', models.CharField(choices=[('topup', 'Top-up'), ('donation', 'Donation'), ('withdrawal', 'Withdrawal')], max_length=20)),
                ('transaction_num', models.IntegerField(blank=True, null=True)),
                ('amount', models.BigIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('photo', models.ImageField(blank=True, null=True, upload_to='transaction_photos/')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('blockchain_tx', models.CharField(blank=True, max_length=255, null=True)),
                ('bank_app', models.CharField(blank=True, max_length=50, null=True)),
                ('prev_hash', models.CharField(blank=True, max_length=64, null=True)),
                ('current_hash', models.CharField(blank=True, max_length=64, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Wallet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('balance', models.BigIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)])),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
