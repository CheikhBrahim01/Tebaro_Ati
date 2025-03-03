from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404

from .blockchain import record_donation_on_chain, transfer_amount, web3

from .models import Transactions, Wallet, Project, Transaction
from .serializers import (
    TransactionSerializer,
    WalletSerializer,
    WalletTopupSerializer,
    ProjectSerializer,
    DonationSerializer,
    WithdrawalSerializer
)

# Vue pour récupérer les informations du portefeuille de l'utilisateur
class WalletDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Vue pour recharger le portefeuille (top-up)
class WalletTopupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WalletTopupSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            transaction_num = serializer.validated_data.get('transaction_num', None)
            photo = serializer.validated_data.get('photo', None)
            phone_number = serializer.validated_data.get('phone_number', None)

            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            # Do NOT update wallet.balance immediately.
            Transaction.objects.create(
                wallet=wallet,
                transaction_type='topup',
                amount=amount,
                transaction_num=transaction_num,
                photo=photo,
                phone_number=phone_number,
                # status will be set to "pending" by default in the model.
            )

            return Response({
                "message": "Top-up request submitted successfully! Await admin approval.",
                "wallet": WalletSerializer(wallet).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # N'affiche que les projets non archivés (is_closed=False)
        return Project.objects.filter(is_closed=False)
    
    def perform_create(self, serializer):
        serializer.save(beneficiary=self.request.user)


# Vue pour la soumission et la consultation des projets
# class ProjectListCreateView(generics.ListCreateAPIView):
#     permission_classes = [IsAuthenticatedOrReadOnly]
#     serializer_class = ProjectSerializer
#     queryset = Project.objects.all()

#     def perform_create(self, serializer):
#         # L'utilisateur connecté est assigné comme bénéficiaire
#         serializer.save(beneficiary=self.request.user)

class MyProjectsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Retourne tous les projets dont le bénéficiaire est l'utilisateur connecté
        return Project.objects.filter(beneficiary=self.request.user)


class ProjectDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

# Vue pour effectuer un don à un projet

# donations/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Wallet, Project, Transaction
from .serializers import DonationSerializer
from .utils import notify_goal_reached_via_fastapi  # <-- Importez votre fonction utilitaire

# from .blockchain import record_donation_on_chain

class DonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DonationSerializer(data=request.data)
        if serializer.is_valid():
            project_id = serializer.validated_data['project_id']
            amount = serializer.validated_data['amount']

            project = get_object_or_404(Project, id=project_id)

            if project.beneficiary == request.user:
                return Response({"error": "Vous ne pouvez pas donner à votre propre projet."}, status=400)

            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            if wallet.balance < amount:
                return Response({"error": "Solde insuffisant."}, status=400)

            wallet.balance -= amount
            project.collected_amount += amount
            wallet.save()
            project.save()

            Transaction.objects.create(
                wallet=wallet,
                project=project,
                transaction_type='donation',
                amount=amount
            )

            # Enregistrer le don sur la blockchain
            try:
                txn_hash = record_donation_on_chain(request.user.phone_number, amount)
                print("Transaction hash:", txn_hash)
            except Exception as e:
                print("Erreur blockchain :", e)

            return Response({"message": "Don effectué avec succès."}, status=200)
        return Response(serializer.errors, status=400)



# class DonationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = DonationSerializer(data=request.data)
#         if serializer.is_valid():
#             project_id = serializer.validated_data['project_id']
#             amount = serializer.validated_data['amount']
#             project = get_object_or_404(Project, id=project_id)

#             # Si le projet est fermé, renvoyer un message informatif
#             if project.is_closed:
#                 return Response(
#                     {"message": "Ce projet est fermé aux dons."},
#                     status=status.HTTP_200_OK
#                 )

#             if not project.can_receive_donations():
#                 return Response(
#                     {"message": "Ce projet a déjà atteint son objectif de financement."},
#                     status=status.HTTP_200_OK
#                 )

#             if project.beneficiary == request.user:
#                 return Response(
#                     {"error": "Vous ne pouvez pas donner à votre propre projet."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             wallet, _ = Wallet.objects.get_or_create(user=request.user)
#             if wallet.balance < amount:
#                 return Response(
#                     {"error": "Solde insuffisant dans le portefeuille."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             wallet.balance -= amount
#             project.collected_amount += amount

#             wallet.save()
#             project.save()

#             Transaction.objects.create(
#                 wallet=wallet,
#                 project=project,
#                 transaction_type='donation',
#                 amount=amount
#             )

#             # Optionnel : si après le don, le projet atteint son objectif, vous pouvez éventuellement fermer le projet automatiquement.
#             if project.collected_amount >= project.target_amount:
#                 project.is_closed = True
#                 project.save()
#                 return Response(
#                     {"message": "Votre don a été accepté et ce projet a atteint son objectif. Il est désormais fermé aux dons."},
#                     status=status.HTTP_200_OK
#                 )


#             return Response({"message": "Don effectué avec succès."}, status=status.HTTP_200_OK)
#  
# 
# 
#        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BeneficiaryWithdrawalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # Récupérer le projet
        project = get_object_or_404(Project, id=project_id)

        # Vérifier que l'utilisateur connecté est le bénéficiaire
        if project.beneficiary != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à retirer les fonds de ce projet."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier si le projet est déjà archivé
        if project.is_closed:
            return Response(
                {"message": "Ce projet est déjà archivé."},
                status=status.HTTP_200_OK
            )

        # Transférer les fonds collectés dans le wallet du bénéficiaire
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        amount_to_withdraw = project.collected_amount

        wallet.balance += amount_to_withdraw
        wallet.save()

        # Créer une transaction de retrait avec statut 'approved'
        Transaction.objects.create(
            wallet=wallet,
            project=project,
            transaction_type='withdrawal',
            amount=amount_to_withdraw,
            status='approved'
        )

        # Marquer le projet comme archivé (fermé aux dons) et réinitialiser collected_amount
        project.collected_amount = 0
        project.is_closed = True
        project.save()

        return Response(
            {"message": "Fonds retirés avec succès et projet archivé."},
            status=status.HTTP_200_OK
        )

# class DonationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = DonationSerializer(data=request.data)
#         if serializer.is_valid():
#             project_id = serializer.validated_data['project_id']
#             amount = serializer.validated_data['amount']

#             # Récupération du projet
#             project = get_object_or_404(Project, id=project_id)

#             # Vérifier si le projet a déjà atteint son objectif
#             if not project.can_receive_donations():
#                 return Response(
#                     {"error": "Ce projet a déjà atteint son objectif de financement."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Vérifier que l'utilisateur ne tente pas de donner à son propre projet
#             if project.beneficiary == request.user:
#                 return Response(
#                     {"error": "Vous ne pouvez pas donner à votre propre projet."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Vérification du portefeuille du donateur
#             wallet, _ = Wallet.objects.get_or_create(user=request.user)
#             if wallet.balance < amount:
#                 return Response(
#                     {"error": "Solde insuffisant dans le portefeuille."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Effectuer la transaction
#             wallet.balance -= amount
#             project.collected_amount += amount

#             wallet.save()
#             project.save()

#             # Créer la transaction de don
#             Transaction.objects.create(
#                 wallet=wallet,
#                 project=project,
#                 transaction_type='donation',
#                 amount=amount
#             )

#             return Response({"message": "Don effectué avec succès"}, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TopDonatorsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        # Filter donation transactions for the project and order them by amount descending
        top_donators = Transaction.objects.filter(
            project_id=project_id,
            transaction_type='donation'
        ).order_by('-amount')[:5]
        serializer = TransactionSerializer(top_donators, many=True)
        return Response(serializer.data)
    
# Vue pour demander un retrait par le bénéficiaire
class WithdrawalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WithdrawalSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            amount = serializer.validated_data['amount']
            bank_app = serializer.validated_data['bank_app']

            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            if wallet.balance < amount:
                return Response({"error": "Insufficient wallet balance."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ne pas déduire le solde immédiatement.
            Transaction.objects.create(
                wallet=wallet,
                transaction_type='withdrawal',
                amount=amount,
                phone_number=phone_number,
                bank_app=bank_app,  # Enregistrement du choix bancaire
                # status defaults to "pending" as defined in your model.
            )

            return Response({"message": "Withdrawal request submitted successfully! Await admin approval."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    


class BeneficiaryProjectWithdrawalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        if project.beneficiary != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à retirer des fonds pour ce projet."},
                status=status.HTTP_403_FORBIDDEN
            )
        if project.collected_amount < project.target_amount:
            return Response(
                {"error": "Le projet n'a pas encore atteint son objectif de financement."},
                status=status.HTTP_400_BAD_REQUEST
            )
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        amount_to_withdraw = project.collected_amount

        wallet.balance += amount_to_withdraw
        wallet.save()

        # Créer une transaction de retrait avec le statut 'approved'
        Transaction.objects.create(
            wallet=wallet,
            project=project,
            transaction_type='withdrawal',
            amount=amount_to_withdraw,
            status='approved'
        )

        # Marquer le projet comme fermé pour les dons et réinitialiser collected_amount
        project.collected_amount = 0
        project.is_closed = True
        project.save()

        return Response(
            {"message": "Les fonds du projet ont été transférés dans votre portefeuille et le projet est désormais fermé aux dons."},
            status=status.HTTP_200_OK
        )

# class BeneficiaryProjectWithdrawalView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, project_id):
#         # Récupérer le projet
#         project = get_object_or_404(Project, id=project_id)
        
#         # Vérifier que l'utilisateur connecté est le bénéficiaire du projet
#         if project.beneficiary != request.user:
#             return Response(
#                 {"error": "Vous n'êtes pas autorisé à retirer des fonds pour ce projet."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Vérifier que le projet a atteint son objectif de financement
#         if project.collected_amount < project.target_amount:
#             return Response(
#                 {"error": "Le projet n'a pas encore atteint son objectif de financement."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Récupérer le portefeuille du bénéficiaire
#         wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
#         # Transférer le montant collecté dans le portefeuille
#         amount_to_withdraw = project.collected_amount
        
#         # Ajouter les fonds au portefeuille
#         wallet.balance += amount_to_withdraw
#         wallet.save()
        
#         # Créer une transaction de retrait avec statut "approved" directement
#         Transaction.objects.create(
#             wallet=wallet,
#             project=project,
#             transaction_type='withdrawal',
#             amount=amount_to_withdraw,
#             status='approved'
#         )
        
#         # Réinitialiser le montant collecté dans le projet
#         project.collected_amount = 0
#         project.save()
        
#         return Response(
#             {"message": "Les fonds du projet ont été transférés dans votre portefeuille."},
#             status=status.HTTP_200_OK
#         )


from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from django.db.models.functions import TruncMonth
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Total projects, users, wallets
        total_projects = Project.objects.count()
        total_users = User.objects.count()
        total_wallets = Wallet.objects.count()

        # Total donations sum (from donation transactions)
        donation_agg = Transaction.objects.filter(transaction_type='donation').aggregate(total=Sum('amount'))
        total_donations = donation_agg['total'] or 0

        # Monthly donation totals for the last 6 months
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_qs = Transaction.objects.filter(
            transaction_type='donation',
            timestamp__gte=six_months_ago
        ).annotate(month=TruncMonth('timestamp')).values('month').annotate(total=Sum('amount')).order_by('month')
        monthly_donations = list(monthly_qs)
        # Format monthly donation data as needed (we'll send the raw ISO date)

        # Get 10 most recent transactions
        recent_transactions_qs = Transaction.objects.all().order_by('-timestamp')[:10]
        recent_transactions = TransactionSerializer(recent_transactions_qs, many=True).data

        data = {
            'totalProjects': total_projects,
            'totalDonations': float(total_donations),
            'totalUsers': total_users,
            'totalWallets': total_wallets,
            'monthlyDonations': monthly_donations,
            'recentTransactions': recent_transactions,
        }
        return Response(data)
    
class WalletTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupérer le portefeuille de l'utilisateur connecté
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        # Récupérer toutes les transactions associées au portefeuille, triées par date décroissante
        transactions = wallet.transactions.all().order_by('-timestamp')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=200)
    


from rest_framework import permissions
from .serializers import AdminTransactionSerializer
from rest_framework import generics, permissions, serializers
from decimal import Decimal
from .models import Transaction
import requests

class AdminTransactionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Transaction.objects.filter(transaction_type__in=['topup', 'withdrawal']).order_by('-updated_at')
    serializer_class = AdminTransactionSerializer

MAX_BALANCE = Decimal('99999999.99')

class AdminTransactionDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Transaction.objects.filter(transaction_type__in=['topup', 'withdrawal'])
    serializer_class = AdminTransactionSerializer

    def perform_update(self, serializer):
        # Save the updated transaction (status change)
        instance = serializer.save()
        wallet = instance.wallet

        # Only update wallet balance if the status is now 'approved'
        # (and only if the transaction wasn't already approved)
        if instance.status == 'approved':
            if instance.transaction_type == 'topup':
                new_balance = wallet.balance + instance.amount
                if new_balance > MAX_BALANCE:
                    raise serializers.ValidationError("Wallet balance exceeds the maximum allowed value.")
                wallet.balance = new_balance
                wallet.save()
            elif instance.transaction_type == 'withdrawal':
                new_balance = wallet.balance - instance.amount
                if new_balance < 0:
                    raise serializers.ValidationError("Insufficient funds in wallet.")
                wallet.balance = new_balance
                wallet.save()

        # Send email notification to the user
        self.send_email_notification(instance)

    def send_email_notification(self, transaction):
        """
        Call the FastAPI microservice to send an email notification to the user.
        """
        # You might want to adjust these values based on your needs.
        user_email = transaction.wallet.user.email
        user_name = transaction.wallet.user.full_name
        subject = f"Transaction #{transaction.id} Update Notification"
        # Customize your email body as needed.
        body = f"""
        <p>Hi {user_name},</p>
        <p>Your transaction (ID: {transaction.id}) for a {transaction.transaction_type} of amount ${transaction.amount} has been updated to <strong>{transaction.status}</strong>.</p>
        <p>Thank you for using our service.</p>
        """
        # FastAPI microservice endpoint URL:
        fastapi_url = "http://localhost:8001/send-email/"
        payload = {
            "email": [user_email],
            "subject": subject,
            "body": body
        }
        try:
            response = requests.post(fastapi_url, json=payload)
            response.raise_for_status()
        except Exception as e:
            # Log the error or handle it as needed
            print(f"Error sending email notification: {e}")


    from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import AdminTransactionSerializer

class AdminTransactionTopupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminTransactionSerializer

    def get_queryset(self):
        # Retourne uniquement les transactions de type "topup"
        return Transaction.objects.filter(transaction_type='topup').order_by('-updated_at')


class AdminTransactionWithdrawalView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminTransactionSerializer

    def get_queryset(self):
        # Retourne uniquement les transactions de type "withdrawal"
        return Transaction.objects.filter(transaction_type='withdrawal').order_by('-updated_at')
    


class TransferView(APIView):
    def post(self, request):
        try:
            sender = request.data.get('sender')
            recipient = request.data.get('recipient')
            amount = float(request.data.get('amount'))  # Convert to float for decimals

            # Validate input
            if not sender or not recipient or amount <= 0:
                return Response({"error": "Invalid input parameters"}, status=400)

            # Validate Ethereum addresses
            if not web3.is_address(sender):
                return Response({"error": "Invalid sender address"}, status=400)
            if not web3.is_address(recipient):
                return Response({"error": "Invalid recipient address"}, status=400)

            # Transfer amount using Web3
            tx_hash = transfer_amount(sender, recipient, amount)
            
            print('tx_hasg'+tx_hash)

            # Fetch transaction details from the blockchain using the web3 instance
            tx_details = web3.eth.get_transaction(tx_hash)
            tx_receipt = web3.eth.get_transaction_receipt(tx_hash)
            block = web3.eth.get_block(tx_receipt.blockNumber)
            timestamp = datetime.datetime.fromtimestamp(block.timestamp, tz=datetime.timezone.utc)


            # Create and save the transaction in the database
            transaction = Transactions.objects.create(
                sender=sender,
                recipient=recipient,
                amount=amount,
                tx_hash=tx_hash,
                block_number=tx_receipt.blockNumber,
                timestamp=timestamp
            )

            # Serialize and return the transaction
            serializer = TransactionSerializer(transaction)
            return Response({"transaction": serializer.data}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
