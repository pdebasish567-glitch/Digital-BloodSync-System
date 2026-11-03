from django.db import models


class EmergencyRequest(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    LEVELS = [('Normal', 'Normal'), ('Urgent', 'Urgent'), ('Critical', 'Critical')]
    STATUSES = [
        ('Searching', 'Searching'),
        ('Donor Found', 'Donor Found'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    patient_name    = models.CharField(max_length=100)
    blood_group     = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    units_required  = models.PositiveIntegerField(default=1)
    urgency_level   = models.CharField(max_length=20, choices=LEVELS, default='Urgent')
    location_name   = models.CharField(max_length=200)
    latitude        = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)
    longitude       = models.DecimalField(max_digits=15, decimal_places=6, null=True, blank=True)
    status          = models.CharField(max_length=30, choices=STATUSES, default='Searching')
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.blood_group} – {self.patient_name} ({self.urgency_level})"


class DonorResponse(models.Model):
    """Records which donor responded (accepted/declined) to an emergency request."""
    ACTION_CHOICES = [('accepted', 'Accepted'), ('declined', 'Declined')]

    emergency_request = models.ForeignKey(
        EmergencyRequest, on_delete=models.CASCADE, related_name='responses'
    )
    donor = models.ForeignKey(
        'users.Donor', on_delete=models.CASCADE, related_name='emergency_responses'
    )
    action    = models.CharField(max_length=10, choices=ACTION_CHOICES)
    responded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('emergency_request', 'donor')  # one response per donor per request

    def __str__(self):
        return f"{self.donor} → ER-{self.emergency_request_id} ({self.action})"


class DonationRecord(models.Model):
    """Tracks a donor's individual donation events."""
    donor         = models.ForeignKey(
        'users.Donor', on_delete=models.CASCADE, related_name='donation_records'
    )
    donation_date = models.DateField()
    blood_group   = models.CharField(max_length=3)
    units_donated = models.PositiveIntegerField(default=1)
    location      = models.CharField(max_length=200, blank=True)
    notes         = models.TextField(blank=True)
    certificate   = models.ImageField(upload_to='certificates/', null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-donation_date']

    def __str__(self):
        return f"{self.donor} – {self.donation_date}"
