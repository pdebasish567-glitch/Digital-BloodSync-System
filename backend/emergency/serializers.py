from rest_framework import serializers
from .models import EmergencyRequest, DonorResponse, DonationRecord
from users.models import Donor


class EmergencyRequestSerializer(serializers.ModelSerializer):
    accepted_count = serializers.SerializerMethodField()

    class Meta:
        model  = EmergencyRequest
        fields = '__all__'

    def get_accepted_count(self, obj):
        return obj.responses.filter(action='accepted').count()


class DonorResponseSerializer(serializers.ModelSerializer):
    donor_name   = serializers.CharField(source='donor.user.get_full_name', read_only=True)
    blood_group  = serializers.CharField(source='donor.blood_group',         read_only=True)
    city         = serializers.CharField(source='donor.city',                read_only=True)
    phone        = serializers.CharField(source='donor.user.phone',          read_only=True)
    latitude     = serializers.DecimalField(source='donor.latitude', max_digits=15, decimal_places=6, read_only=True)
    longitude    = serializers.DecimalField(source='donor.longitude', max_digits=15, decimal_places=6, read_only=True)
    donor_id     = serializers.IntegerField(source='donor.id', read_only=True)

    class Meta:
        model  = DonorResponse
        fields = ['id', 'donor_id', 'donor_name', 'blood_group', 'city', 'phone',
                  'latitude', 'longitude', 'action', 'responded_at']


class DonationRecordSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.user.get_full_name', read_only=True)
    certificate_url = serializers.SerializerMethodField()

    class Meta:
        model  = DonationRecord
        fields = ['id', 'donor', 'donor_name', 'donation_date', 'blood_group',
                  'units_donated', 'location', 'notes', 'certificate',
                  'certificate_url', 'created_at']
        read_only_fields = ['donor', 'created_at']   # donor is set by perform_create

    def get_certificate_url(self, obj):
        if obj.certificate:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate.url)
            return obj.certificate.url
        return None
