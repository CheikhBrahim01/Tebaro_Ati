# users/views_reset.py

import requests
from django.conf import settings
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import OTP, User  
from django.contrib.auth.hashers import make_password

class RequestPasswordResetView(APIView):
    """
    Étape 1 : L'utilisateur entre son numéro de téléphone et reçoit un OTP.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response({"error": "Le numéro de téléphone est requis."}, status=400)
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({"error": "Aucun compte trouvé avec ce numéro."}, status=400)

        # Appeler votre service d'envoi d'OTP (ex. Chinguisoft) :
        otp_code = self._send_otp(phone_number)
        if not otp_code:
            return Response({"error": "Échec de l'envoi de l'OTP."}, status=500)

        # Sauvegarder ou mettre à jour l'OTP en base
        OTP.objects.update_or_create(
            phone_number=phone_number,
            defaults={'code': otp_code, 'created_at': now()}
        )
        return Response({"message": "Un OTP a été envoyé à votre numéro."}, status=200)

    def _send_otp(self, phone_number):
        try:
            url = f"https://chinguisoft.com/api/sms/validation/{settings.CHINGUISOFT_VALIDATION_KEY}"
            headers = {
                'Validation-token': settings.CHINGUISOFT_TOKEN,
                'Content-Type': 'application/json',
            }
            data = {'phone': phone_number, 'lang': 'fr'}
            response = requests.post(url, headers=headers, json=data)
            response_data = response.json()
            if response.status_code == 200 and "code" in response_data:
                return str(response_data["code"])
            return None
        except requests.exceptions.RequestException:
            return None

class VerifyOTPView(APIView):
    """
    Vérifie que l'OTP est correct et valide.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        code = request.data.get("otp")
        if not phone_number or not code:
            return Response({"error": "Le numéro de téléphone et l'OTP sont requis."}, status=400)
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=400)
        otp_entry = OTP.objects.filter(phone_number=phone_number, code=code).first()
        if not otp_entry or not otp_entry.is_valid():
            return Response({"error": "OTP invalide ou expiré."}, status=400)
        # Par exemple, on peut mettre à jour un champ is_phone_verified pour l'utilisateur :
        user.is_phone_verified = True
        user.save()
        otp_entry.delete()  # Supprimez l'OTP après vérification
        return Response({"message": "OTP vérifié. Vous pouvez maintenant réinitialiser votre mot de passe."}, status=200)

class ResetPasswordView(APIView):
    """
    Réinitialise le mot de passe après vérification de l'OTP.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp_code = request.data.get("otp")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not phone_number or not otp_code or not new_password or not confirm_password:
            return Response({"error": "Tous les champs sont obligatoires."}, status=400)
        if new_password != confirm_password:
            return Response({"error": "Les mots de passe ne correspondent pas."}, status=400)
        otp_entry = OTP.objects.filter(phone_number=phone_number, code=otp_code).first()
        if not otp_entry or not otp_entry.is_valid():
            return Response({"error": "OTP invalide ou expiré."}, status=400)
        try:
            user = User.objects.get(phone_number=phone_number)
            user.set_password(new_password)
            user.save()
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=400)
        otp_entry.delete()
        return Response({"message": "Mot de passe réinitialisé avec succès !"}, status=200)
