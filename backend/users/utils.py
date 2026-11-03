"""
Digital Blood Sync — Notification Utilities
=========================================
All donor/emergency/auth notifications are sent via:
  1. Email  (Django mail → SMTP / Console backend)
  2. SMS    (Twilio → real donor phone number)

Phone number format: stored as 10-digit Indian number in User.phone
→ formatted to +91XXXXXXXXXX before sending via Twilio.

Twilio credentials are read from Django settings (loaded from .env).
If credentials are blank/placeholder, SMS is gracefully skipped with a log.
"""
from django.core.mail import send_mail
from django.conf import settings
import secrets


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _from_email():
    return getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@digitalbloodsync.com')


def _send_email(subject, message, to_list):
    """Send email. Returns True on success, False on failure."""
    try:
        send_mail(subject, message, _from_email(), to_list, fail_silently=False)
        print(f"[Email ✓] '{subject}' → {to_list}")
        return True
    except Exception as e:
        print(f"[Email ✗] '{subject}' → {to_list}: {e}")
        return False


def _format_phone(raw_phone):
    """
    Convert a 10-digit Indian mobile number to E.164 format (+91XXXXXXXXXX).
    Returns None if the number is invalid or empty.
    """
    if not raw_phone:
        return None
    digits = ''.join(filter(str.isdigit, str(raw_phone)))
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith('91'):
        return f"+{digits}"
    return None


def _send_sms(to_raw_phone, body):
    """
    Send SMS via Twilio.
    Returns True on success, False on failure (gracefully — never crashes the app).
    """
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    auth_token  = getattr(settings, 'TWILIO_AUTH_TOKEN',  '')
    from_number = getattr(settings, 'TWILIO_FROM_NUMBER', '')

    # Graceful skip if credentials are not configured
    if not account_sid or not auth_token or not from_number:
        print("[SMS ⚠] Twilio credentials not configured — SMS skipped.")
        return False
    if account_sid.startswith('ACxxx') or auth_token == 'your_twilio_auth_token_here':
        print("[SMS ⚠] Twilio credentials are placeholder values — SMS skipped.")
        return False

    to_number = _format_phone(to_raw_phone)
    if not to_number:
        print(f"[SMS ⚠] Invalid phone number '{to_raw_phone}' — SMS skipped.")
        return False

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            body=body,
            from_=from_number,
            to=to_number,
        )
        print(f"[SMS ✓] SID={msg.sid} → {to_number}")
        return True
    except Exception as e:
        print(f"[SMS ✗] → {to_number}: {e}")
        return False


def _notify(subject, email_body, sms_body, to_email, to_phone=None):
    """
    Unified dispatcher: sends both email AND SMS.
    Returns dict: {'email': bool, 'sms': bool}
    """
    email_ok = _send_email(subject, email_body, [to_email]) if to_email else False
    sms_ok   = _send_sms(to_phone, sms_body)                if to_phone else False
    return {'email': email_ok, 'sms': sms_ok}


# ─────────────────────────────────────────────────────────────────────────────
# 1. DONOR APPROVED
# ─────────────────────────────────────────────────────────────────────────────

def send_approval_email(to_email, donor_name, phone=None):
    """
    Sends approval notification + pre/post donation health guidelines.
    Also sends an SMS to the donor's phone if available.
    """
    subject = "✅ Your Donor Account is Approved — Digital Blood Sync"

    email_body = (
        f"Dear {donor_name},\n\n"
        f"Congratulations! Your blood donor account has been APPROVED by the hospital administrator.\n"
        f"You are now an active donor on Digital Blood Sync.\n\n"
        f"━━━ PRE-DONATION GUIDELINES ━━━\n"
        f"• Eat a healthy, iron-rich meal before donating.\n"
        f"• Stay well-hydrated (drink 2–3 extra glasses of water).\n"
        f"• Sleep well the night before.\n"
        f"• Avoid alcohol for 24 hours before donation.\n\n"
        f"━━━ POST-DONATION CARE ━━━\n"
        f"• Rest for 10–15 minutes after donation.\n"
        f"• Drink extra fluids over the next 24 hours.\n"
        f"• Avoid strenuous activity for the rest of the day.\n"
        f"• Eat iron-rich foods to replenish.\n\n"
        f"When an emergency blood request matches your blood group and location,\n"
        f"you will receive an instant notification on your donor dashboard.\n\n"
        f"Thank you for saving lives.\n\n"
        f"— Digital Blood Sync Team"
    )

    sms_body = (
        f"[Digital Blood Sync] Hi {donor_name}! "
        f"Your blood donor registration has been APPROVED. "
        f"Login to your dashboard: {getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')}/donor-dashboard "
        f"Thank you for saving lives!"
    )

    return _notify(subject, email_body, sms_body, to_email, phone)


# ─────────────────────────────────────────────────────────────────────────────
# 2. DONOR REJECTED
# ─────────────────────────────────────────────────────────────────────────────

def send_rejection_email(to_email, donor_name, reason="", phone=None):
    """Sends rejection notification with reapply guidance. Also sends SMS."""
    subject = "❌ Donor Registration Update — Digital Blood Sync"
    reason_line = f"\nReason: {reason}\n" if reason else ""

    email_body = (
        f"Dear {donor_name},\n\n"
        f"We regret to inform you that your donor registration has not been approved at this time.{reason_line}\n"
        f"Common reasons for rejection include:\n"
        f"• Hemoglobin below 12.5 g/dL\n"
        f"• Weight below 50 kg\n"
        f"• Age outside the 18–65 range\n"
        f"• Recent illness or medication\n"
        f"• Incomplete or invalid documents\n\n"
        f"You may re-register after addressing the above, or contact the hospital for more information.\n\n"
        f"— Digital Blood Sync Team"
    )

    reason_sms = f" Reason: {reason}." if reason else ""
    sms_body = (
        f"[Digital Blood Sync] Hi {donor_name}, your donor registration was not approved at this time.{reason_sms} "
        f"Please contact the hospital or re-register after addressing the concern."
    )

    return _notify(subject, email_body, sms_body, to_email, phone)


# ─────────────────────────────────────────────────────────────────────────────
# 3. EMERGENCY ALERT — single donor
# ─────────────────────────────────────────────────────────────────────────────

def send_emergency_alert(donor_email, donor_name, donor_phone,
                         blood_group, patient_name,
                         hospital_name, units_needed, location_name=""):
    """
    Notifies a single approved donor about an emergency blood request.
    Sends both email and SMS.
    """
    subject = f"🚨 Emergency Blood Request — {blood_group} Needed · Digital Blood Sync"
    dashboard_url = f"{getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')}/donor-dashboard"

    email_body = (
        f"Dear {donor_name},\n\n"
        f"An EMERGENCY blood request has been submitted on Digital Blood Sync.\n\n"
        f"━━━ REQUEST DETAILS ━━━\n"
        f"  Blood Group Required : {blood_group}\n"
        f"  Patient Name         : {patient_name or 'Confidential'}\n"
        f"  Hospital             : {hospital_name}\n"
        f"  Units Needed         : {units_needed}\n"
        f"  Location             : {location_name or 'See dashboard'}\n\n"
        f"If you are available and eligible to donate, please log in to your\n"
        f"Donor Dashboard immediately and accept the request.\n\n"
        f"  👉 {dashboard_url}\n\n"
        f"Every minute matters — your blood can save a life today.\n\n"
        f"If you are unable to donate, please ignore this message.\n\n"
        f"— Digital Blood Sync Emergency Coordination Team"
    )

    sms_body = (
        f"[EMERGENCY] Digital Blood Sync: {blood_group} blood needed urgently at {hospital_name}! "
        f"Patient: {patient_name or 'Confidential'}. Units: {units_needed}. "
        f"Login NOW: {dashboard_url}"
    )

    return _notify(subject, email_body, sms_body, donor_email, donor_phone)


# ─────────────────────────────────────────────────────────────────────────────
# 4. BULK EMERGENCY ALERT — all approved donors of matching blood group
# ─────────────────────────────────────────────────────────────────────────────

def notify_all_donors_emergency(blood_group, patient_name, hospital_name,
                                 units_needed, contact_info=""):
    """
    Bulk-notify ALL approved donors of a matching blood group via email + SMS.
    Returns (email_success, sms_success, total_donors).
    """
    from users.models import Donor   # late import to avoid circular dependency

    donors = Donor.objects.select_related('user').filter(
        approval_status='APPROVED',
        blood_group=blood_group,
    )

    email_ok = sms_ok = total = 0
    for donor in donors:
        total += 1
        result = send_emergency_alert(
            donor_email=donor.user.email,
            donor_name=donor.user.first_name or donor.user.get_full_name(),
            donor_phone=donor.user.phone,          # 10-digit stored in User.phone
            blood_group=blood_group,
            patient_name=patient_name,
            hospital_name=hospital_name,
            units_needed=units_needed,
            location_name=contact_info,
        )
        if result.get('email'): email_ok += 1
        if result.get('sms'):   sms_ok   += 1

    print(f"[Bulk Alert] blood_group={blood_group} donors={total} "
          f"email_sent={email_ok} sms_sent={sms_ok}")
    return email_ok, sms_ok, total


# ─────────────────────────────────────────────────────────────────────────────
# 5. FORGOT / RESET PASSWORD
# ─────────────────────────────────────────────────────────────────────────────

def generate_reset_token():
    """Generates a cryptographically secure 48-character URL-safe token."""
    return secrets.token_urlsafe(36)


def send_password_reset_email(to_email, user_name, reset_token, phone=None):
    """
    Sends a password-reset link via email.
    Also sends an SMS with the same link if phone is provided.
    Token is valid for 30 minutes.
    """
    frontend_base = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
    reset_link = f"{frontend_base}/reset-password?token={reset_token}"

    subject = "🔑 Reset Your Password — Digital Blood Sync"

    email_body = (
        f"Dear {user_name},\n\n"
        f"We received a request to reset the password for your Digital Blood Sync account.\n\n"
        f"Click the link below to reset your password (valid for 30 minutes):\n\n"
        f"  {reset_link}\n\n"
        f"If you did not request a password reset, please ignore this email.\n"
        f"Your account is safe — no changes have been made.\n\n"
        f"━━━ SECURITY TIPS ━━━\n"
        f"• Never share your password with anyone.\n"
        f"• Use a strong, unique password.\n"
        f"• This link expires in 30 minutes.\n\n"
        f"— Digital Blood Sync Team"
    )

    sms_body = (
        f"[Digital Blood Sync] Password reset requested. "
        f"Click to reset (expires in 30 min): {reset_link} "
        f"If you did not request this, ignore this message."
    )

    return _notify(subject, email_body, sms_body, to_email, phone)