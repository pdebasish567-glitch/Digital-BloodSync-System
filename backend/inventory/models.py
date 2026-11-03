from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

class BloodUnit(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    COMPONENTS = [
        ('Whole Blood', 'Whole Blood'),
        ('PRBC', 'PRBC'),
        ('Plasma', 'Plasma'),
        ('Platelets', 'Platelets'),
    ]
    
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    component = models.CharField(max_length=20, choices=COMPONENTS)
    units = models.PositiveIntegerField(default=1)
    collection_date = models.DateField()
    expiry_date = models.DateField()
    
    def clean(self):
        if self.expiry_date <= self.collection_date:
            raise ValidationError("Expiry date must be after the collection date.")
            
    @property
    def status(self):
        today = timezone.now().date()
        days_left = (self.expiry_date - today).days
        if days_left < 0:
            return "Expired"
        elif days_left <= 7:
            return "Expiring Soon"
        elif self.units < 5:
            return "Low Stock"
        return "Available"
