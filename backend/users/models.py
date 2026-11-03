from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin / Hospital'
        DONOR = 'DONOR', 'Donor'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.DONOR)
    phone_regex = RegexValidator(
        regex=r'^[6-9]\d{9}$',
        message="Phone number must be a valid 10-digit Indian number starting with 6-9."
    )
    phone = models.CharField(validators=[phone_regex], max_length=10, unique=True, null=True, blank=True)

    def __str__(self):
        return self.username


class HospitalProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_profile')
    hospital_name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.hospital_name


class Donor(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    GENDERS = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    age = models.PositiveIntegerField(validators=[MinValueValidator(18), MaxValueValidator(65)])
    gender = models.CharField(max_length=10, choices=GENDERS, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(50.0)])
    hemoglobin = models.DecimalField(max_digits=4, decimal_places=1, validators=[MinValueValidator(12.5)])
    address = models.TextField()
    city = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=6)
    emergency_contact = models.CharField(max_length=10)          # now mandatory (no blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    preferred_time = models.CharField(max_length=20, default='Morning')

    latitude = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)

    last_donation = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    approval_status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='PENDING'
    )

    # ── Document uploads ─────────────────────────────────────────────────────
    profile_photo       = models.ImageField(upload_to='donors/photos/',    null=True, blank=True)
    hemoglobin_document = models.FileField(upload_to='donors/documents/',  null=True, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.blood_group})"


class PasswordResetToken(models.Model):
    """Stores a single-use password-reset token per user (replaces old ones on re-request)."""
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='reset_token')
    token      = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """Token is valid for 30 minutes."""
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() < self.created_at + timedelta(minutes=30)

    def __str__(self):
        return f"ResetToken for {self.user.email}"
