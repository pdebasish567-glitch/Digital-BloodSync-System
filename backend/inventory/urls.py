from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BloodUnitViewSet, public_blood_summary

router = DefaultRouter()
router.register(r'inventory', BloodUnitViewSet)

urlpatterns = [
    path('summary/', public_blood_summary, name='public-blood-summary'),
    path('', include(router.urls)),
]
