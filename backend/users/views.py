from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import qrcode
import io
import base64
from PIL import Image

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    PhoneLoginSerializer,
    TwoFactorSetupSerializer
)


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Crée l'utilisateur

            # Générer les tokens pour cet utilisateur
            refresh = RefreshToken.for_user(user)

            # Générer le QR code pour la 2FA
            totp = pyotp.TOTP(user.two_factor_secret)
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp.provisioning_uri(
                name=user.email,
                issuer_name='YourAppName'  # Nom affiché dans l'app d'auth
            ))
            qr.make(fit=True)

            # Convertir le QR code en base64
            img = qr.make_image(fill_color="black", back_color="white")
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            qr_code_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "user_type": user.user_type
                },
                "two_factor_secret": user.two_factor_secret,
                "qr_code": qr_code_base64
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']

            try:
                user = User.objects.get(phone_number=phone_number)
            except User.DoesNotExist:
                return Response({"error": "Invalid phone number or password."},
                                status=status.HTTP_401_UNAUTHORIZED)

            if not user.check_password(password):
                return Response({"error": "Invalid phone number or password."},
                                status=status.HTTP_401_UNAUTHORIZED)

            # Vérifier si user a déjà activé la 2FA
            if user.is_verified:
                # 2FA est déjà activée => on demande le code
                return Response({
                    "message": "2FA required",
                    "two_factor_required": True,
                    "user_id": user.id
                }, status=status.HTTP_200_OK)
            else:
                # 2FA pas encore activée => on donne les tokens directement
                refresh = RefreshToken.for_user(user)
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                        "phone_number": user.phone_number,
                        "user_type": user.user_type
                    }
                }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SetupTwoFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TwoFactorSetupSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()  # user.is_verified = True
            return Response({"message": "Two-factor authentication successfully enabled"},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class VerifyTwoFactorView(APIView):
    """
    Vue utilisée lors du login si user.is_verified=True.
    On attend user_id et token pour vérifier le TOTP et renvoyer les tokens JWT.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        token = request.data.get('token')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        totp = pyotp.TOTP(user.two_factor_secret)
        if totp.verify(token):
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "user_type": user.user_type
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)