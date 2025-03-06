from rest_framework import serializers
from .models import Wallet, Project, Transaction

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'last_updated']

class WalletTopupSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    transaction_num = serializers.IntegerField(required=False)
    photo = serializers.ImageField(required=False, allow_empty_file=True)


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'beneficiary', 'title', 'description', 
            'target_amount', 'collected_amount', 'created_at', 
            'is_validated', 'photo'
        ]
        read_only_fields = ['beneficiary', 'collected_amount', 'created_at', 'is_validated']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'project', 'transaction_type', 'phone_number',
            'transaction_num', 'amount', 'photo', 'timestamp', 'blockchain_tx', 'status'
        ]
        read_only_fields = ['id', 'wallet', 'project', 'transaction_type', 'timestamp', 'blockchain_tx']

class DonationSerializer(serializers.Serializer):
    project_id = serializers.IntegerField()
    amount = serializers.IntegerField(min_value=1)

class WithdrawalSerializer(serializers.Serializer):
    phone_number = serializers.IntegerField()
    amount = serializers.IntegerField(min_value=1)
    bank_app = serializers.ChoiceField(
        choices=[
            ('paypal', 'PayPal'),
            ('venmo', 'Venmo'),
            ('revolut', 'Revolut'),
            ('other', 'Other')
        ],
        required=True,
        help_text="Sélectionnez l'application bancaire sur laquelle vous souhaitez recevoir vos fonds."
    )


class AdminTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 
            'transaction_type', 
            'transaction_num', 
            'amount', 
            'phone_number', 
            'photo', 
            'status', 
            'timestamp'
        ]
        read_only_fields = [
            'id', 
            'transaction_type', 
            'transaction_num', 
            'amount', 
            'phone_number', 
            'photo', 
            'timestamp'
        ]

# class TransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Transaction
#         fields = '__all__'
