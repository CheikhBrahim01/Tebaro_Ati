import hashlib
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

class Wallet(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.BigIntegerField(default=0, validators=[MinValueValidator(0)])
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet de {self.user.full_name} – Solde: {self.balance}"


class Project(models.Model):
    beneficiary = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    target_amount = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    collected_amount = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    is_validated = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='project_photos/', null=True, blank=True)
    # Nouveau champ pour archiver le projet
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def can_receive_donations(self):
        """
        Retourne True si le projet n'est pas archivé et n'a pas encore atteint son objectif.
        """
        return not self.is_closed and self.collected_amount < self.target_amount
    





# class Transaction(models.Model):
#     TRANSACTION_TYPES = [
#         ('topup', 'Top-up'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
#         ('withdrawal', 'Withdrawal'),
#     ]
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#     ]
#     wallet = models.ForeignKey(
#         Wallet,
#         on_delete=models.CASCADE,
#         related_name='transactions'
#     )
#     project = models.ForeignKey(
#         Project,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='transactions'
#     )
#     phone_number = models.IntegerField(null=True, blank=True)
#     transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
#     transaction_num = models.IntegerField(null=True, blank=True)
#     # Pour les transactions, vous pouvez également utiliser des entiers
#     amount = models.BigIntegerField(validators=[MinValueValidator(1)])
#     photo = models.ImageField(upload_to='transaction_photos/', null=True, blank=True)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     blockchain_tx = models.CharField(
#         max_length=255,
#         blank=True,
#         null=True,
#         help_text="Identifiant de la transaction sur la blockchain"
#     )
#     bank_app = models.CharField(max_length=50, null=True, blank=True)

#     def __str__(self):
#         return f"{self.get_transaction_type_display()} – {self.amount} par {self.wallet.user.full_name}"
    

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('topup', 'Top-up'),
        ('donation', 'Donation'),
        ('withdrawal', 'Withdrawal'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    project = models.ForeignKey('Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    transaction_num = models.IntegerField(null=True, blank=True)
    amount = models.BigIntegerField(validators=[MinValueValidator(1)])
    photo = models.ImageField(upload_to='transaction_photos/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    blockchain_tx = models.CharField(max_length=255, blank=True, null=True)
    bank_app = models.CharField(max_length=50, null=True, blank=True)
    # Nouveaux champs pour la chaîne de hachage
    prev_hash = models.CharField(max_length=64, blank=True, null=True)
    current_hash = models.CharField(max_length=64, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Avant de sauvegarder, calculez le hash actuel à partir des données
        # On peut concaténer les champs importants et le hash précédent
        data = f"{self.wallet.id}{self.transaction_type}{self.amount}{self.timestamp}{self.prev_hash}"
        self.current_hash = hashlib.sha256(data.encode()).hexdigest()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} – {self.amount} par {self.wallet.user.full_name}"
    
class LogEntry(models.Model):
    message = models.TextField()
    # Utilisez TextField pour ne pas avoir de limite stricte
    signature = models.TextField()  
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LogEntry {self.id} at {self.timestamp}"
