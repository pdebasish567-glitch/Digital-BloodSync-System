# DFD — Level 0 & Level 1
# Digital Blood Sync System

---

## LEVEL 0 — CONTEXT DIAGRAM (DFD)

> Shows the entire system as a single process. All external actors and their
> data exchanges with the system are represented. No internal detail is shown.

```mermaid
flowchart LR

    %% ── External Entities ──────────────────────────────────
    DA(["🩸 DONOR"])
    HA(["🏥 HOSPITAL\nADMIN"])
    PU(["🔍 PUBLIC /\nPATIENT"])
    ES(["📧 EMAIL\nSERVICE\n(SMTP)"])
    SS(["📱 SMS\nSERVICE\n(Twilio)"])

    %% ── Central System Process ──────────────────────────────
    SYS[["       ⚙️ DIGITAL BLOOD SYNC SYSTEM       \n              Process 0              "]]

    %% ── DONOR ↔ SYSTEM ──────────────────────────────────────
    DA -- "Registration form\nHealth documents\nGPS coordinates\nAvailability toggle\nDonation records\nForgot password request" --> SYS
    SYS -- "JWT access token\nApproval / rejection notice\nEmergency alert\nPassword reset link\nDonation certificate" --> DA

    %% ── ADMIN ↔ SYSTEM ──────────────────────────────────────
    HA -- "Admin login credentials\nDonor approve / reject decision\nBlood unit add / edit / delete\nEmergency request management" --> SYS
    SYS -- "JWT access token\nDonor list with profiles\nLive blood inventory\nEmergency dashboard\nDonation audit logs" --> HA

    %% ── PUBLIC ↔ SYSTEM ─────────────────────────────────────
    PU -- "Blood group search query\nEmergency request details\n(patient name, blood group,\nunits, location, urgency)" --> SYS
    SYS -- "Live blood availability\nStock status per blood group\nEmergency confirmation" --> PU

    %% ── EMAIL SERVICE ↔ SYSTEM ──────────────────────────────
    SYS -- "Recipient email address\nEmail subject & body\n(Approval/Rejection/Emergency/Reset)" --> ES
    ES -- "Delivery status" --> SYS

    %% ── SMS SERVICE ↔ SYSTEM ────────────────────────────────
    SYS -- "Recipient phone (+91 E.164)\nSMS body text\n(Approval/Emergency/Reset)" --> SS
    SS -- "Delivery status" --> SYS

    %% ── Styles ──────────────────────────────────────────────
    style SYS fill:#fef2f2,stroke:#b91c1c,stroke-width:3px,color:#0f172a
    style DA  fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px
    style HA  fill:#fff1f2,stroke:#b91c1c,stroke-width:2px
    style PU  fill:#f0f9ff,stroke:#0891b2,stroke-width:2px
    style ES  fill:#fefce8,stroke:#ca8a04,stroke-width:2px
    style SS  fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

### Level 0 — Description

| Actor | Role | Data Sent INTO System | Data Received FROM System |
|---|---|---|---|
| **Donor** | Blood donor — registers, uploads documents, responds to emergencies | Registration form, health documents, GPS, availability toggle, donation records, forgot-password request | JWT token, approval/rejection email+SMS, emergency alert, reset link, donation certificate |
| **Hospital Admin** | System manager — manages blood inventory, approves donors, handles emergencies | Login credentials, approve/reject decisions, blood unit CRUD data, emergency management inputs | JWT token, donor profiles, live inventory, emergency dashboard, donation audit logs |
| **Public / Patient** | Unauthenticated user — searches blood, submits emergency | Blood group query, emergency request (patient name, blood group, units, location, urgency) | Live blood availability, stock status badges, emergency submission confirmation |
| **Email Service (SMTP)** | External notification gateway — Gmail/AWS SES | Delivery status report | Email payload: recipient, subject, body |
| **SMS Service (Twilio)** | External SMS gateway | Delivery status report | SMS payload: recipient phone (+91 E.164), SMS body |

---
---

## LEVEL 1 — DETAILED DFD

> Decomposes the system (Process 0) into 8 sub-processes. Shows internal
> data flows, all 6 data stores, and interactions between processes.

```mermaid
flowchart TB

    %% ════════════════════════════════════════
    %% EXTERNAL ENTITIES
    %% ════════════════════════════════════════
    DA(["🩸 DONOR"])
    HA(["🏥 HOSPITAL ADMIN"])
    PU(["🔍 PUBLIC / PATIENT"])
    ES(["📧 EMAIL SERVICE"])
    SS(["📱 SMS SERVICE"])

    %% ════════════════════════════════════════
    %% DATA STORES
    %% ════════════════════════════════════════
    D1[/"DS1: USER DB\n(email, phone, role, password)"/]
    D2[/"DS2: DONOR PROFILE DB\n(blood group, GPS, docs, approval)"/]
    D3[/"DS3: BLOOD INVENTORY DB\n(units, component, expiry)"/]
    D4[/"DS4: EMERGENCY REQUEST DB\n(patient, blood group, status)"/]
    D5[/"DS5: DONATION RECORD DB\n(date, units, certificate)"/]
    D6[/"DS6: PASSWORD RESET TOKEN DB\n(token, TTL 30 min)"/]

    %% ════════════════════════════════════════
    %% PROCESSES
    %% ════════════════════════════════════════
    P1["P1\n─────────────\nUser Registration\n& Authentication"]
    P2["P2\n─────────────\nDonor Profile\nManagement"]
    P3["P3\n─────────────\nBlood Inventory\nManagement"]
    P4["P4\n─────────────\nEmergency Request\nHandling"]
    P5["P5\n─────────────\nNotification\nDispatch"]
    P6["P6\n─────────────\nDonation History\nManagement"]
    P7["P7\n─────────────\nPublic Blood\nAvailability"]
    P8["P8\n─────────────\nPassword Reset\nFlow"]

    %% ════════════════════════════════════════
    %% P1 — REGISTRATION & AUTH
    %% ════════════════════════════════════════
    DA -- "Email, password,\nname, phone" --> P1
    HA -- "Admin login\ncredentials" --> P1
    P1 -- "JWT token" --> DA
    P1 -- "JWT token" --> HA
    P1 -- "Write new user\nrecord" --> D1
    D1 -- "Read user\nfor login" --> P1

    %% ════════════════════════════════════════
    %% P2 — DONOR PROFILE
    %% ════════════════════════════════════════
    DA -- "Blood group, age, weight,\nhemoglobin, GPS, documents,\nemergency contact" --> P2
    P2 -- "Store donor\nprofile" --> D2
    D2 -- "Read donor\nprofiles" --> P2
    HA -- "Approve / reject\nwith reason" --> P2
    P2 -- "Updated approval\nstatus" --> DA
    P2 -- "All donor\nprofiles + docs" --> HA
    P2 -- "Approval/rejection\ntrigger + phone" --> P5

    %% ════════════════════════════════════════
    %% P3 — BLOOD INVENTORY
    %% ════════════════════════════════════════
    HA -- "Add / edit / delete\nblood unit data" --> P3
    P3 -- "Write blood\nunit record" --> D3
    D3 -- "Read inventory\nrecords" --> P3
    P3 -- "Inventory report\n& dashboard" --> HA

    %% ════════════════════════════════════════
    %% P4 — EMERGENCY REQUEST
    %% ════════════════════════════════════════
    PU -- "Patient name, blood group,\nunits required, urgency level,\nlocation name, GPS" --> P4
    HA -- "View & update\nemergency status" --> P4
    P4 -- "Write emergency\nrequest record" --> D4
    D4 -- "Read emergency\nrecords" --> P4
    P4 -- "Submission\nconfirmation" --> PU
    P4 -- "Emergency\ndashboard" --> HA
    D2 -- "Matching donors\n(blood group filter)" --> P4
    P4 -- "Bulk emergency\nalert trigger" --> P5

    %% ════════════════════════════════════════
    %% P5 — NOTIFICATION DISPATCH
    %% ════════════════════════════════════════
    P5 -- "Email payload\n(subject, body, recipient)" --> ES
    P5 -- "SMS payload\n(+91 phone, body)" --> SS
    ES -- "Delivery status" --> P5
    SS -- "Delivery status" --> P5
    P5 -- "Alert delivered\nto donor" --> DA

    %% ════════════════════════════════════════
    %% P6 — DONATION HISTORY
    %% ════════════════════════════════════════
    DA -- "Donation date, blood group,\nunits donated, location,\nnotes, certificate image" --> P6
    P6 -- "Write donation\nrecord" --> D5
    D5 -- "Read donation\nhistory" --> P6
    P6 -- "Donation history\n& certificate" --> DA
    HA -- "View donor\ndonation audit" --> P6
    P6 -- "Audit report" --> HA

    %% ════════════════════════════════════════
    %% P7 — PUBLIC BLOOD AVAILABILITY
    %% ════════════════════════════════════════
    PU -- "Blood group\nsearch" --> P7
    D3 -- "Live blood\nunit data" --> P7
    P7 -- "Blood group, units,\nstatus badges\n(Available/Low/Critical)" --> PU

    %% ════════════════════════════════════════
    %% P8 — PASSWORD RESET
    %% ════════════════════════════════════════
    DA -- "Email address for\npassword reset" --> P8
    D1 -- "Verify user\nexists" --> P8
    P8 -- "Write reset\ntoken (30 min TTL)" --> D6
    D6 -- "Read & validate\ntoken" --> P8
    P8 -- "Reset link\ntrigger" --> P5
    DA -- "New password +\nreset token" --> P8
    P8 -- "Update hashed\npassword" --> D1
    P8 -- "Delete used\ntoken" --> D6

    %% ════════════════════════════════════════
    %% STYLES
    %% ════════════════════════════════════════
    style P1 fill:#ede9fe,stroke:#7c3aed,stroke-width:2px
    style P2 fill:#fff1f2,stroke:#b91c1c,stroke-width:2px
    style P3 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style P4 fill:#fff7ed,stroke:#ea580c,stroke-width:2px
    style P5 fill:#fefce8,stroke:#ca8a04,stroke-width:2px
    style P6 fill:#fdf2f8,stroke:#db2777,stroke-width:2px
    style P7 fill:#f0f9ff,stroke:#0891b2,stroke-width:2px
    style P8 fill:#f1f5f9,stroke:#475569,stroke-width:2px

    style D1 fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style D2 fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style D3 fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style D4 fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style D5 fill:#f8fafc,stroke:#64748b,stroke-width:2px
    style D6 fill:#f8fafc,stroke:#64748b,stroke-width:2px

    style DA fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px
    style HA fill:#fff1f2,stroke:#b91c1c,stroke-width:2px
    style PU fill:#f0f9ff,stroke:#0891b2,stroke-width:2px
    style ES fill:#fefce8,stroke:#ca8a04,stroke-width:2px
    style SS fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## Level 1 — Process Descriptions

### P1 — User Registration & Authentication
**Purpose:** Handles sign-up and login for Donors and Admin users.

| Data Flow | Direction | Description |
|---|---|---|
| Email, password, name, phone | Donor → P1 | New donor fills sign-up form |
| Admin login credentials | Admin → P1 | Admin logs into dashboard |
| JWT Token | P1 → Donor / Admin | Returned on successful login |
| Write user record | P1 → DS1 | New user saved to User DB |
| Read user for login | DS1 → P1 | Looks up user by email to verify password |

**Connects to:** DS1 (User DB)  
**Implemented in:** `users/views.py` — `RegisterView`, `LoginView`, `MeView`

---

### P2 — Donor Profile Management
**Purpose:** Manages the full donor lifecycle — registration, document upload, GPS, and admin approval.

| Data Flow | Direction | Description |
|---|---|---|
| Blood group, age, weight, hemoglobin, GPS, documents | Donor → P2 | Donor completes 4-step profile form |
| Store donor profile | P2 → DS2 | Profile written to Donor DB |
| Approve / reject with reason | Admin → P2 | Admin makes approval decision |
| Updated approval status | P2 → Donor | Donor profile status updated |
| Approval/rejection trigger + phone | P2 → P5 | Fires email + SMS notification |

**Connects to:** DS2 (Donor DB), P5 (Notification)  
**Implemented in:** `users/views.py` — `DonorViewSet`, `approve_donor`, `reject_donor`

---

### P3 — Blood Inventory Management
**Purpose:** Admin manages blood unit records — add, edit, delete. Live stock is derived from this data.

| Data Flow | Direction | Description |
|---|---|---|
| Add / edit / delete blood unit | Admin → P3 | Admin performs CRUD from dashboard |
| Write blood unit record | P3 → DS3 | Blood unit saved/updated in DB |
| Read inventory records | DS3 → P3 | Fetches current stock for dashboard |
| Inventory report | P3 → Admin | Admin sees full inventory with expiry status |

**Connects to:** DS3 (Blood Inventory DB)  
**Implemented in:** `inventory/views.py` — `BloodUnitViewSet`

---

### P4 — Emergency Request Handling
**Purpose:** Processes emergency blood requests submitted by public users and notifies matching donors.

| Data Flow | Direction | Description |
|---|---|---|
| Patient name, blood group, units, urgency, location | Public → P4 | Emergency form submitted |
| Write emergency record | P4 → DS4 | Request stored with status = Searching |
| Matching donors (blood group filter) | DS2 → P4 | Donor DB queried for matching blood group |
| Bulk emergency alert trigger | P4 → P5 | Triggers notification to all matched donors |
| Emergency dashboard | P4 → Admin | Admin sees all active emergencies |

**Connects to:** DS2, DS4, P5  
**Implemented in:** `emergency/views.py` — `EmergencyRequestViewSet.perform_create()`

---

### P5 — Notification Dispatch
**Purpose:** Central dispatcher for all email and SMS notifications — approval, rejection, emergency alerts, and password resets.

| Data Flow | Direction | Description |
|---|---|---|
| Email payload | P5 → Email Service | Subject + body + recipient sent via SMTP |
| SMS payload | P5 → SMS Service | +91 phone + body sent via Twilio API |
| Delivery status | Email/SMS → P5 | Acknowledgement returned (logged) |
| Alert delivered | P5 → Donor | Donor receives notification |

**Events that trigger P5:**
- Donor approved → approval email + SMS
- Donor rejected → rejection email + SMS with reason
- Emergency submitted → bulk email + SMS to all matching donors
- Forgot password → reset link email + SMS

**Implemented in:** `users/utils.py` — `_notify()`, `send_approval_email()`, `send_rejection_email()`, `notify_all_donors_emergency()`, `send_password_reset_email()`

---

### P6 — Donation History Management
**Purpose:** Donors log individual donation events with date, units, location, and certificate upload.

| Data Flow | Direction | Description |
|---|---|---|
| Donation date, blood group, units, location, certificate | Donor → P6 | Donor adds new donation record |
| Write donation record | P6 → DS5 | Saved to Donation Record DB |
| Read donation history | DS5 → P6 | Retrieves all past donations for donor |
| Donation history + certificate | P6 → Donor | Donor sees full history with download links |
| Audit report | P6 → Admin | Admin can view any donor's complete donation log |

**Connects to:** DS5 (Donation Record DB)  
**Implemented in:** `emergency/views.py` — `DonationRecordViewSet`

---

### P7 — Public Blood Availability
**Purpose:** Serves live blood stock data to public users without requiring login.

| Data Flow | Direction | Description |
|---|---|---|
| Blood group search | Public → P7 | User selects a blood group to check |
| Live blood unit data | DS3 → P7 | Reads all non-expired units from Blood Inventory DB |
| Blood group, units, status badges | P7 → Public | Returns Available / Low Stock / Critical / Out of Stock |

**Connects to:** DS3 (Blood Inventory DB)  
**Implemented in:** `inventory/views.py` — `public_blood_summary()` (AllowAny permission)

---

### P8 — Password Reset Flow
**Purpose:** Securely handles forgot-password requests with a time-limited, single-use token.

| Data Flow | Direction | Description |
|---|---|---|
| Email address for reset | Donor → P8 | Donor submits forgot-password form |
| Verify user exists | DS1 → P8 | Checks USER DB for the email |
| Write reset token (30-min TTL) | P8 → DS6 | One-time token stored |
| Reset link trigger | P8 → P5 | P5 fires email + SMS with reset URL |
| New password + reset token | Donor → P8 | Donor opens link and submits new password |
| Update hashed password | P8 → DS1 | New bcrypt password hash written to USER DB |
| Delete used token | P8 → DS6 | Token destroyed — prevents reuse |

**Connects to:** DS1, DS6, P5  
**Implemented in:** `users/views.py` — `forgot_password()`, `reset_password()`

---

## Data Store Summary

| Store | Tables (Django Models) | Used By |
|---|---|---|
| **DS1 — User DB** | `User` (AbstractUser) | P1, P2, P8 |
| **DS2 — Donor Profile DB** | `Donor` | P2, P4, P6 |
| **DS3 — Blood Inventory DB** | `BloodUnit` | P3, P7 |
| **DS4 — Emergency Request DB** | `EmergencyRequest`, `DonorResponse` | P4 |
| **DS5 — Donation Record DB** | `DonationRecord` | P6 |
| **DS6 — Password Reset Token DB** | `PasswordResetToken` | P8 |
