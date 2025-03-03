from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['phone_number', 'full_name', 'email', 'user_type', 'status', 'is_verified']
    list_filter = ['user_type', 'status', 'is_verified']
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'email')}),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'user_type', 'status', 'is_verified'
            )
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'phone_number', 'full_name', 'email',
                'password1', 'password2',
                'user_type', 'status'
            )
        }),
    )
    search_fields = ['phone_number', 'full_name', 'email']
    ordering = ['phone_number']

admin.site.register(User, CustomUserAdmin)