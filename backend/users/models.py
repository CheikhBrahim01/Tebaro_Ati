from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator, validate_email
from django.utils.translation import gettext_lazy as _
from django_otp.models import Device

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, full_name, email, password=None, **extra_fields):
        if not phone_number:
            raise ValueError(_("Phone number is required."))
        if not full_name:
            raise ValueError(_("Full name is required."))
        if not email:
            raise ValueError(_("Email is required."))

        # Set default values
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', False)
        extra_fields.setdefault('user_type', 'beneficiary') 
        

        # Create user
        user = self.model(
            phone_number=phone_number, 
            full_name=full_name, 
            email=email, 
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, full_name, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('user_type', 'administrator')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(phone_number, full_name, email, password, **extra_fields)
    


class User(AbstractUser):
    # Existing fields
    username = None
    phone_regex = RegexValidator(
    regex=r'^[234]\d{7}$',
    message="Phone number must start with 2, 3, or 4 and must be exactly 8 digits."
    )
    phone_number = models.CharField(
        max_length=15, unique=True, validators=[phone_regex], verbose_name=_("Phone Number")
    )
    full_name = models.CharField(max_length=100, verbose_name=_("Full Name"))
    email = models.EmailField(
        max_length=255, unique=True, blank=False, null=False, validators=[validate_email]
    )

    # 2FA specific fields
    is_verified = models.BooleanField(default=False, verbose_name=_("2FA Verified"))
    two_factor_secret = models.CharField(
        max_length=32, 
        null=True, 
        blank=True, 
        verbose_name=_("Two-Factor Secret")
    )

    # User type and status (as before)
    USER_TYPE_CHOICES = [
        ('beneficiary', 'Beneficiary'),
        ('donor', 'Donor'),
        ('administrator', 'Administrator'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='beneficiary')

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Suspended', 'Suspended'),
        ('Inactive', 'Inactive'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    # Authentication settings
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name', 'email']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"
    