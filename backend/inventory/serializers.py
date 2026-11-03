from rest_framework import serializers
from .models import BloodUnit

class BloodUnitSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()

    class Meta:
        model = BloodUnit
        fields = '__all__'

    def validate(self, data):
        collection_date = data.get('collection_date')
        expiry_date = data.get('expiry_date')
        
        if collection_date and expiry_date:
            if expiry_date <= collection_date:
                raise serializers.ValidationError({
                    "expiry_date": "Verification Failed: Expiry date must be strictly after the collection date."
                })
        return data
