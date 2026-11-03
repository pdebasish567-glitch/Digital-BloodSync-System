from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import BloodUnit
from .serializers import BloodUnitSerializer


class BloodUnitViewSet(viewsets.ModelViewSet):
    queryset = BloodUnit.objects.all().order_by('blood_group', 'expiry_date')
    serializer_class = BloodUnitSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])
def public_blood_summary(request):
    """
    Public endpoint — no auth required.
    Returns aggregated non-expired blood unit counts by blood group.
    Used by the public Home and Blood Availability pages.
    """
    today = timezone.now().date()
    units = BloodUnit.objects.filter(expiry_date__gte=today)

    summary = {}
    for u in units:
        if u.blood_group not in summary:
            summary[u.blood_group] = 0
        summary[u.blood_group] += u.units

    result = [
        {
            "blood_group": group,
            "units": count,
            "status": (
                "Available" if count >= 10 else
                "Low Stock"  if count >= 5  else
                "Critical"   if count > 0   else
                "Out of Stock"
            ),
        }
        for group, count in sorted(summary.items())
    ]
    return Response(result)
