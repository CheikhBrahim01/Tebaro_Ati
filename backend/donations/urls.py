from django.urls import path
from .views import (
    AdminStatsView,
    AdminTransactionDetailView,
    AdminTransactionListView,
    ProjectDetailView,
    TopDonatorsView,
    WalletDetailView,
    WalletTopupView,
    WalletTransactionHistoryView,
    ProjectListCreateView,
    DonationView,
    WithdrawalView,
    BeneficiaryProjectWithdrawalView,
    MyProjectsListView,
    BeneficiaryWithdrawalView,
    AdminTransactionTopupView,
    AdminTransactionWithdrawalView,
)

urlpatterns = [
    path('wallet/', WalletDetailView.as_view(), name='wallet-detail'),
    path('wallet/topup/', WalletTopupView.as_view(), name='wallet-topup'),
    path('wallet/transactions/', WalletTransactionHistoryView.as_view(), name='wallet-transactions'),
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/top-donators/', TopDonatorsView.as_view(), name='top-donators'),
    path('projects/<int:project_id>/withdraw-funds/', BeneficiaryProjectWithdrawalView.as_view(), name='project-withdraw-funds'),
    path('donate/', DonationView.as_view(), name='donate'),
    path('withdraw/', WithdrawalView.as_view(), name='withdraw'),
    path('my-projects/', MyProjectsListView.as_view(), name='my-projects'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('projects/<int:project_id>/withdraw-funds/', BeneficiaryWithdrawalView.as_view(), name='project-withdraw-funds'),
    path('admin/transactions/', AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path('admin/transactions/<int:pk>/', AdminTransactionDetailView.as_view(), name='admin-transaction-detail'),
    path('admin/transactions/topup/', AdminTransactionTopupView.as_view(), name='admin-transaction-topup'),
    
    path('admin/transactions/withdrawal/', AdminTransactionWithdrawalView.as_view(), name='admin-transaction-withdrawal'),
]
