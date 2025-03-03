from django.contrib import admin
from .models import Wallet, Project, Transaction

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'last_updated']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'beneficiary', 'target_amount', 'collected_amount', 'created_at', 'is_validated']
    list_filter = ['is_validated', 'created_at']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'transaction_type', 'amount', 'timestamp']
    list_filter = ['transaction_type', 'timestamp']
