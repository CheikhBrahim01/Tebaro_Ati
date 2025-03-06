from django.urls import path
from .views_reset import RequestPasswordResetView, VerifyOTPView, ResetPasswordView
from .views import (
    SignUpView,
    LoginView,
    SetupTwoFactorView,
    VerifyTwoFactorView
)

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('setup-2fa/', SetupTwoFactorView.as_view(), name='setup_two_factor'),
    path('verify-2fa/', VerifyTwoFactorView.as_view(), name='verify_two_factor'),
    path('request-reset/', RequestPasswordResetView.as_view(), name='request-reset'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]