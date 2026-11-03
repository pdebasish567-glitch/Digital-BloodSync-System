from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonorViewSet, register_donor, register_hospital,
    login_user, me, stats,
    pending_donors, approve_donor, reject_donor, toggle_availability,
    forgot_password, reset_password,
)

router = DefaultRouter()
router.register(r'donors', DonorViewSet)

# IMPORTANT: Custom donor paths MUST come before router.urls include,
# because the router generates donors/<pk>/ which would match "pending" as a pk.
urlpatterns = [
    # Auth endpoints
    path('auth/register-donor/',    register_donor,    name='register-donor'),
    path('auth/register-hospital/', register_hospital, name='register-hospital'),
    path('auth/login/',             login_user,        name='login'),
    path('auth/me/',                me,                name='me'),
    path('auth/forgot-password/',   forgot_password,   name='forgot-password'),
    path('auth/reset-password/',    reset_password,    name='reset-password'),

    # Stats
    path('stats/', stats, name='stats'),

    # Donor — custom actions MUST come before router include
    path('donors/pending/',              pending_donors,       name='pending-donors'),
    path('donors/<int:pk>/approve/',     approve_donor,        name='approve-donor'),
    path('donors/<int:pk>/reject/',      reject_donor,         name='reject-donor'),
    path('donors/toggle-availability/',  toggle_availability,  name='toggle-availability'),

    # DRF router (donors/ list + detail, etc.) — placed LAST
    path('', include(router.urls)),
]