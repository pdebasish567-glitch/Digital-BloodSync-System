from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Donor
from .serializers import (
    RegisterDonorSerializer, RegisterHospitalSerializer,
    LoginSerializer, UserMeSerializer, DonorSerializer
)
from .utils import send_approval_email, send_rejection_email



def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_donor(request):
    # Accepts both multipart/form-data (with file uploads) and application/json
    serializer = RegisterDonorSerializer(
        data=request.data, context={'request': request}
    )
    if serializer.is_valid():
        donor = serializer.save()
        tokens = get_tokens(donor.user)
        return Response({
            'message': 'Donor registered successfully.',
            'tokens': tokens,
            'role': 'DONOR',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_hospital(request):
    serializer = RegisterHospitalSerializer(data=request.data)
    if serializer.is_valid():
        hospital = serializer.save()
        tokens = get_tokens(hospital.user)
        return Response({
            'message': 'Hospital registered successfully.',
            'tokens': tokens,
            'role': 'ADMIN',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens(user)
        return Response({
            'message': 'Login successful.',
            'tokens': tokens,
            'role': user.role,
            'name': user.get_full_name() or user.email,
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserMeSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    """Returns live stats for admin dashboard overview."""
    from inventory.models import BloodUnit
    from emergency.models import EmergencyRequest
    from django.utils import timezone

    today = timezone.now().date()
    all_units = BloodUnit.objects.all()

    expired_units   = [u for u in all_units if u.expiry_date < today]
    valid_units     = [u for u in all_units if u.expiry_date >= today]
    expiring_soon   = [u for u in valid_units if 0 < (u.expiry_date - today).days <= 7]
    low_stock_units = [u for u in valid_units if u.units < 5]

    # total_blood_units = only non-expired units
    total_valid     = sum(u.units for u in valid_units)
    total_expired   = sum(u.units for u in expired_units)

    return Response({
        'total_blood_units':         total_valid,    # excludes expired
        'expired_units_count':       total_expired,
        'active_emergency_requests': EmergencyRequest.objects.filter(status='Searching').count(),
        'pending_donors':            Donor.objects.filter(approval_status='PENDING').count(),
        'approved_donors':           Donor.objects.filter(approval_status='APPROVED').count(),
        'registered_donors':         Donor.objects.count(),
        'expiring_soon':             len(expiring_soon),
        'expired':                   len(expired_units),
        'low_stock':                 len(low_stock_units),
    })



class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.select_related('user').filter(approval_status='APPROVED')
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_donors(request):
    """Returns all donors whose approval_status is PENDING — admin only."""
    if request.user.role != 'ADMIN':
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    donors = Donor.objects.select_related('user').filter(approval_status='PENDING')
    result = []
    for d in donors:
        def abs_url(field):
            if field:
                return request.build_absolute_uri(field.url)
            return None
        result.append({
            'id':                      d.id,
            'full_name':               d.user.get_full_name(),
            'email':                   d.user.email,
            'phone':                   d.user.phone,
            'blood_group':             d.blood_group,
            'age':                     d.age,
            'gender':                  d.gender,
            'weight':                  str(d.weight),
            'hemoglobin':              str(d.hemoglobin),
            'address':                 d.address,
            'city':                    d.city,
            'pin_code':                d.pin_code,
            'emergency_contact':       d.emergency_contact,
            'occupation':              d.occupation,
            'preferred_time':          d.preferred_time,
            'last_donation':           str(d.last_donation) if d.last_donation else None,
            'latitude':                str(d.latitude)  if d.latitude  else None,
            'longitude':               str(d.longitude) if d.longitude else None,
            'approval_status':         d.approval_status,
            'profile_photo_url':       abs_url(d.profile_photo),
            'hemoglobin_document_url': abs_url(d.hemoglobin_document),
        })
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_donor(request, pk):
    """Approves a pending donor, updates status, and triggers Email + SMS. Admin only."""
    if request.user.role != 'ADMIN':
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        donor = Donor.objects.select_related('user').get(pk=pk)
    except Donor.DoesNotExist:
        return Response({'detail': 'Donor not found.'}, status=status.HTTP_404_NOT_FOUND)

    donor.approval_status = 'APPROVED'
    donor.save()

    result = send_approval_email(
        to_email=donor.user.email,
        donor_name=donor.user.first_name or donor.user.get_full_name(),
        phone=donor.user.phone,
    )

    return Response({
        'message':        f'Donor {donor.user.get_full_name()} approved successfully.',
        'email_sent':     result.get('email', False),
        'sms_sent':       result.get('sms', False),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_donor(request, pk):
    """Rejects a pending donor registration. Admin only. Sends email + SMS."""
    if request.user.role != 'ADMIN':
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        donor = Donor.objects.select_related('user').get(pk=pk)
    except Donor.DoesNotExist:
        return Response({'detail': 'Donor not found.'}, status=status.HTTP_404_NOT_FOUND)

    donor.approval_status = 'REJECTED'
    donor.save()

    reason = request.data.get('reason', '')
    result = send_rejection_email(
        to_email=donor.user.email,
        donor_name=donor.user.first_name or donor.user.get_full_name(),
        reason=reason,
        phone=donor.user.phone,
    )

    return Response({
        'message':    f'Donor {donor.user.get_full_name()} rejected.',
        'email_sent': result.get('email', False),
        'sms_sent':   result.get('sms', False),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_availability(request):
    """Donor toggles their own is_available flag."""
    try:
        donor = request.user.donor_profile
    except Exception:
        return Response({'detail': 'Donor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    donor.is_available = not donor.is_available
    donor.save(update_fields=['is_available'])
    return Response({'is_available': donor.is_available})


# ─────────────────────────────────────────────────────────────────────────────
# FORGOT PASSWORD — step 1: user submits email, receives reset link
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }
    Generates a reset token, stores it, and emails the reset link.
    Always returns 200 to prevent email enumeration.
    """
    from django.contrib.auth import get_user_model
    from .models import PasswordResetToken
    from .utils import generate_reset_token, send_password_reset_email

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    try:
        user = User.objects.get(email__iexact=email)
        token_str = generate_reset_token()
        # Upsert: one token per user — deletes old one if exists
        PasswordResetToken.objects.filter(user=user).delete()
        PasswordResetToken.objects.create(user=user, token=token_str)

        sent = send_password_reset_email(
            to_email=user.email,
            user_name=user.first_name or user.email,
            reset_token=token_str,
            phone=user.phone,    # also send SMS with reset link
        )
        print(f"[ForgotPassword] token for {email}: {token_str} | result={sent}")
    except User.DoesNotExist:
        # Don't reveal whether the email exists
        pass

    return Response({
        'message': 'If this email is registered, a password reset link has been sent.'
    }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# RESET PASSWORD — step 2: user submits token + new password
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    POST /api/auth/reset-password/
    Body: { "token": "<token>", "password": "<new_password>", "confirm_password": "<new_password>" }
    Validates token (expiry 30 min), sets new password, deletes the token.
    """
    from .models import PasswordResetToken

    token_str        = request.data.get('token', '').strip()
    password         = request.data.get('password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not token_str:
        return Response({'detail': 'Reset token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'detail': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        reset_obj = PasswordResetToken.objects.select_related('user').get(token=token_str)
    except PasswordResetToken.DoesNotExist:
        return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not reset_obj.is_valid():
        reset_obj.delete()
        return Response({'detail': 'This reset link has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    user = reset_obj.user
    user.set_password(password)
    user.save()
    reset_obj.delete()   # single-use: remove after successful reset

    return Response({'message': 'Password reset successful. You can now log in with your new password.'}, status=status.HTTP_200_OK)