from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
import pyotp
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'phone_number', 'full_name', 'email',
            'password', 'password2'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        # Générer un secret 2FA dès la création
        validated_data['two_factor_secret'] = pyotp.random_base32()
        user = User.objects.create_user(**validated_data)
        return user

class PhoneLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

class TwoFactorSetupSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, token):
        user = self.context['request'].user
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(token):
            raise serializers.ValidationError("Invalid token. Please try again.")
        return token

    def save(self):
        """
        Si le token est valide, on active la 2FA pour cet utilisateur.
        """
        user = self.context['request'].user
        user.is_verified = True
        user.save()