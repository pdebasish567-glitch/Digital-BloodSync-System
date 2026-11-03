from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import EmergencyRequest, DonorResponse, DonationRecord
from .serializers import (
    EmergencyRequestSerializer, DonorResponseSerializer,
    DonationRecordSerializer
)


class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset           = EmergencyRequest.objects.all().order_by('-created_at')
    serializer_class   = EmergencyRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Save the emergency request, then email all approved donors with the matching blood group."""
        emergency = serializer.save()

        try:
            from users.utils import notify_all_donors_emergency
            try:
                hospital_name = self.request.user.hospital_profile.hospital_name
            except Exception:
                hospital_name = self.request.user.get_full_name() or "Capital Hospital"

            notify_all_donors_emergency(
                blood_group=emergency.blood_group,
                patient_name=emergency.patient_name,
                hospital_name=hospital_name,
                units_needed=emergency.units_required,
                contact_info=emergency.location_name,
            )
        except Exception as exc:
            print(f"[Emergency Email] Failed to send donor notifications: {exc}")

    @action(detail=True, methods=['post'], url_path='respond')
    def respond(self, request, pk=None):
        """Donor calls this to accept or decline an emergency request."""
        emergency = self.get_object()

        # Only approved donors can respond
        try:
            donor = request.user.donor_profile
        except Exception:
            return Response({'detail': 'Donor profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        if donor.approval_status != 'APPROVED':
            return Response({'detail': 'Only approved donors can respond.'}, status=status.HTTP_403_FORBIDDEN)

        action_val = request.data.get('action', '').lower()
        if action_val not in ('accepted', 'declined'):
            return Response({'detail': "action must be 'accepted' or 'declined'."}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = DonorResponse.objects.update_or_create(
            emergency_request=emergency,
            donor=donor,
            defaults={'action': action_val}
        )

        # If at least one donor accepted, update request status
        if action_val == 'accepted':
            if emergency.status == 'Searching':
                emergency.status = 'Donor Found'
                emergency.save()

        serializer = DonorResponseSerializer(obj)
        return Response({
            'message': f'Response recorded: {action_val}.',
            'response': serializer.data,
            'request_status': emergency.status,
        })

    @action(detail=True, methods=['get'], url_path='responses')
    def list_responses(self, request, pk=None):
        """Admin: get all donor responses for a specific emergency request."""
        emergency = self.get_object()
        responses = emergency.responses.select_related('donor__user').all()
        serializer = DonorResponseSerializer(responses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-response')
    def my_response(self, request):
        """Return the current donor's response for all requests they've responded to."""
        try:
            donor = request.user.donor_profile
        except Exception:
            return Response([])
        responses = DonorResponse.objects.filter(donor=donor).values('emergency_request_id', 'action')
        return Response({str(r['emergency_request_id']): r['action'] for r in responses})


class DonationRecordViewSet(viewsets.ModelViewSet):
    serializer_class   = DonationRecordSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        # Admin can see all records; donor sees only their own
        if user.role == 'ADMIN':
            donor_id = self.request.query_params.get('donor_id')
            if donor_id:
                return DonationRecord.objects.filter(donor_id=donor_id).select_related('donor__user')
            return DonationRecord.objects.all().select_related('donor__user')
        try:
            return DonationRecord.objects.filter(donor=user.donor_profile)
        except Exception:
            return DonationRecord.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'DONOR':
            try:
                serializer.save(donor=user.donor_profile)
            except Exception:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Donor profile not found.")
        else:
            serializer.save()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
