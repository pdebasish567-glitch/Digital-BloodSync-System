from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction
import re
from datetime import date
from .models import Donor, User, HospitalProfile


# ── Auth Serializers ───────────────────────────────────────────────────────────

class RegisterDonorSerializer(serializers.Serializer):
    # ── Account fields ────────────────────────────────────────────────────────
    full_name         = serializers.CharField(max_length=150)
    email             = serializers.EmailField()
    phone             = serializers.CharField(max_length=10)
    password          = serializers.CharField(min_length=8, write_only=True)

    # ── Medical fields ────────────────────────────────────────────────────────
    blood_group       = serializers.ChoiceField(choices=['A+','A-','B+','B-','AB+','AB-','O+','O-'])
    age               = serializers.IntegerField(min_value=18, max_value=65)
    gender            = serializers.ChoiceField(choices=['Male','Female','Other'], required=False, allow_blank=True)
    weight            = serializers.DecimalField(max_digits=5, decimal_places=2)
    hemoglobin        = serializers.DecimalField(max_digits=4, decimal_places=1)
    emergency_contact = serializers.CharField(max_length=10)               # mandatory
    occupation        = serializers.CharField(max_length=100, required=False, allow_blank=True)
    preferred_time    = serializers.ChoiceField(
        choices=['Morning', 'Afternoon', 'Evening'],
        required=False, allow_blank=True, default='Morning'
    )
    last_donation     = serializers.DateField(required=False, allow_null=True)

    # ── Location fields ───────────────────────────────────────────────────────
    address           = serializers.CharField()
    city              = serializers.CharField(max_length=100)
    pin_code          = serializers.CharField(max_length=6)
    latitude          = serializers.DecimalField(max_digits=15, decimal_places=6, required=False, allow_null=True)
    longitude         = serializers.DecimalField(max_digits=15, decimal_places=6, required=False, allow_null=True)

    # ── Document uploads ──────────────────────────────────────────────────────
    profile_photo       = serializers.ImageField(required=False, allow_null=True)
    hemoglobin_document = serializers.FileField(required=False, allow_null=True)

    # ── Validators ────────────────────────────────────────────────────────────
    def validate_phone(self, value):
        if not re.match(r'^[6-9]\d{9}$', str(value)):
            raise serializers.ValidationError("Must be a valid 10-digit Indian mobile number starting with 6-9.")
        return value

    def validate_emergency_contact(self, value):
        if not re.match(r'^[6-9]\d{9}$', str(value)):
            raise serializers.ValidationError("Emergency contact must be a valid 10-digit Indian mobile number.")
        return value

    def validate_weight(self, value):
        if float(value) < 50:
            raise serializers.ValidationError("Weight must be at least 50 kg to be eligible.")
        return value

    def validate_hemoglobin(self, value):
        if float(value) < 12.5:
            raise serializers.ValidationError("Hemoglobin must be at least 12.5 g/dL to be eligible.")
        return value

    def validate_last_donation(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("Last donation date cannot be in the future.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value.strip().lower()).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.strip().lower()

    def validate_pin_code(self, value):
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("PIN code must be exactly 6 digits.")
        return value

    def validate_preferred_time(self, value):
        if not value:
            return 'Morning'
        return value

    @transaction.atomic
    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        email     = validated_data.pop('email')
        phone     = validated_data.pop('phone')
        password  = validated_data.pop('password')
        first_name, *rest = full_name.split()
        last_name = ' '.join(rest)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=User.Role.DONOR
        )
        donor = Donor.objects.create(user=user, **validated_data)
        return donor


class RegisterHospitalSerializer(serializers.Serializer):
    hospital_name = serializers.CharField(max_length=200)
    registration_number = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=10)
    password = serializers.CharField(min_length=8, write_only=True)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    pin_code = serializers.CharField(max_length=6)
    latitude = serializers.DecimalField(max_digits=15, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=15, decimal_places=6, required=False, allow_null=True)

    def validate_phone(self, value):
        if not re.match(r'^[6-9]\d{9}$', str(value)):
            raise serializers.ValidationError("Must be a valid 10-digit Indian mobile number.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_registration_number(self, value):
        if HospitalProfile.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("A hospital with this registration number already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        hospital_name = validated_data.pop('hospital_name')
        registration_number = validated_data.pop('registration_number')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=hospital_name,
            phone=phone,
            role=User.Role.ADMIN
        )
        hospital = HospitalProfile.objects.create(
            user=user,
            hospital_name=hospital_name,
            registration_number=registration_number,
            **validated_data
        )
        return hospital


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password. Please try again.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        data['user'] = user
        return data


# ── Profile Serializers ────────────────────────────────────────────────────────

class UserMeSerializer(serializers.ModelSerializer):
    donor_profile = serializers.SerializerMethodField()
    hospital_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'donor_profile', 'hospital_profile']

    def get_donor_profile(self, obj):
        if hasattr(obj, 'donor_profile'):
            d   = obj.donor_profile
            req = self.context.get('request')
            def abs_url(field):
                if field and req:
                    return req.build_absolute_uri(field.url)
                return None
            return {
                'id':                    d.id,
                'blood_group':           d.blood_group,
                'age':                   d.age,
                'gender':                d.gender,
                'weight':                str(d.weight)     if d.weight     else None,
                'hemoglobin':            str(d.hemoglobin) if d.hemoglobin else None,
                'address':               d.address,
                'city':                  d.city,
                'pin_code':              d.pin_code,
                'occupation':            d.occupation,
                'emergency_contact':     d.emergency_contact,
                'preferred_time':        d.preferred_time,
                'is_available':          d.is_available,
                'last_donation':         str(d.last_donation) if d.last_donation else None,
                'latitude':              str(d.latitude)  if d.latitude  else None,
                'longitude':             str(d.longitude) if d.longitude else None,
                'approval_status':       d.approval_status,
                'profile_photo_url':     abs_url(d.profile_photo),
                'hemoglobin_document_url': abs_url(d.hemoglobin_document),
            }
        return None

    def get_hospital_profile(self, obj):
        if hasattr(obj, 'hospital_profile'):
            h = obj.hospital_profile
            return {'id': h.id, 'hospital_name': h.hospital_name, 'city': h.city}
        return None


class DonorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Donor
        fields = '__all__'