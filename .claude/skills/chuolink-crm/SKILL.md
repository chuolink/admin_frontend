---
name: chuolink-crm
description: >
  Helps implement Chuolink CRM features including lead management, sales call tracking,
  consultation scheduling, and activity logging. Use when working on lead sources,
  conversion funnels, call logs, consultation outcomes, or any customer relationship
  management features for the education consultancy.
---

# Chuolink CRM System

## Lead Sources

Chuolink acquires clients through these channels:
- **SCHOOL_VISIT** — Staff visits to secondary schools
- **ONLINE** — Website, social media ads
- **OFFICE_VISIT** — Walk-in clients
- **SALES_CALL** — Outbound calling campaigns
- **REFERRAL** — Existing student referrals
- **SOCIAL_MEDIA** — Organic social media engagement
- **THIRD_PARTY** — TV, radio, influencer marketing

## Lead Status Flow
```
NEW → CONTACTED → CONSULTATION_SCHEDULED → CONSULTATION_DONE → CONVERTED → (Student)
                                                              → LOST
```

## Models

### LeadModel (prefix='lead_')
- source, status, student_name, parent_name, phone_number, email
- notes, assigned_to (FK User), converted_student (FK StudentModel, nullable)
- follow_up_date

### SalesCallModel (prefix='call_')
- lead (FK, nullable), student (FK, nullable), caller (FK User)
- call_type: OUTBOUND | INBOUND
- purpose: LEAD_FOLLOW_UP | CONSULTATION | PARENT_FOLLOW_UP | DOCUMENT_REMINDER | PAYMENT_REMINDER | GENERAL
- outcome: ANSWERED | NO_ANSWER | BUSY | CALLBACK_REQUESTED | VOICEMAIL
- duration_minutes, notes, follow_up_required, follow_up_date

### ConsultationModel (prefix='consultation_')
- lead (FK, nullable), student (FK, nullable), consultant (FK User)
- consultation_type: IN_PERSON | PHONE | VIDEO
- status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
- scheduled_at, completed_at, summary
- recommended_courses, recommended_universities
- parent_contacted (bool)
- outcome: INTERESTED | NEEDS_TIME | NOT_INTERESTED | CONVERTED

### ActivityLogModel (prefix='activity_')
- user (FK), activity_type: CALL | EMAIL | MEETING | NOTE | DOCUMENT_REQUEST | PAYMENT_FOLLOW_UP | ESCORT | OTHER
- related_student (FK, nullable), related_application (FK, nullable)
- description

## Frontend Pages

### /admin/leads
- Data table with filters: source, status, assigned_to, date range
- Quick actions: log call, schedule consultation, convert to student
- Stat cards: total leads, new this week, conversion rate, pending follow-ups

### /admin/sales-calls
- Call log table with filters: caller, outcome, date
- Daily/weekly metrics per staff member
- Follow-up reminders (overdue highlighted)

### /admin/consultations
- List view with filters: type, status, consultant, date
- Log outcomes and link to student after conversion

### Consultant Pages
- `/consultant/leads` — scoped to consultant's assigned leads
- `/consultant/sales-calls` — scoped to consultant's calls

## API Endpoints Pattern
```
/api/v1/admin/leads/                       # CRUD
/api/v1/admin/leads/{id}/convert/          # Convert lead to student
/api/v1/admin/sales-calls/                 # CRUD
/api/v1/admin/consultations/               # CRUD
/api/v1/admin/activity-logs/               # List activities
/api/v1/consultant/leads/                  # Consultant's leads
/api/v1/consultant/sales-calls/            # Consultant's calls
```
