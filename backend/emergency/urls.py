from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmergencyRequestViewSet, DonationRecordViewSet

router = DefaultRouter()
router.register(r'requests',         EmergencyRequestViewSet,  basename='emergency')
router.register(r'donation-records', DonationRecordViewSet,    basename='donation-records')

urlpatterns = [
    path('', include(router.urls)),
]
