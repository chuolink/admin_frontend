# Pipeline/Leads Workflow Restructure Plan

## Current Flow (Problem)
```
Student applies → Application created → Pipeline created immediately (via signal)
```
Every application auto-creates a pipeline, even if the student hasn't paid admission fee. This means:
- Pipeline is cluttered with unpaid/uncommitted students
- No CRM opportunity to follow up and convince students to pay
- Leads page only has manually-created leads, not app students

## New Flow (Goal)
```
Student applies → Application created (status=PENDING) → Student appears as Lead automatically
   ↓                                                           ↓
   (admin can call, log notes, consult)              Lead page shows their applications
   ↓
Student pays admission fee → Pipeline created → Processing begins
```

---

## Changes Required

### Phase 1: Backend — Stop auto-creating pipelines on application

**File: `operations/signals.py`**
- Remove or disable the `post_save` signal on `UniversityApplicationModel` that calls `auto_create_pipeline()`
- Pipeline should ONLY be created when admission fee is paid

**File: `operations/signals.py` or new signal**
- Add a new signal/hook: when `PaymentModel` status changes to `SUCCESS` AND it's an admission fee payment (`priority=100` or linked to an application):
  1. Set `application.admission_fee_paid = True`
  2. Create `StudentPipelineModel` for that application
  3. Initialize pipeline stages
  4. Log journey event

### Phase 2: Backend — Auto-create leads from app students

**File: `operations/signals.py` or `app/signals.py`**
- Add `post_save` signal on `UniversityApplicationModel`:
  - When a new application is created, check if a LeadModel exists for this student
  - If no lead exists, create one:
    ```python
    LeadModel.objects.get_or_create(
        converted_student=application.student,
        defaults={
            'source': 'APP',
            'status': 'NEW',
            'student_name': student.user.get_full_name(),
            'email': student.user.email,
            'phone_number': student.phone or '',
            'is_app_student': True,
        }
    )
    ```
  - If lead already exists, just update `status` to reflect new activity

### Phase 3: Backend — Add application count & filters to Leads API

**File: `operations/views.py` — `LeadViewSet`**
- Annotate queryset with `applications_count` (count of UniversityApplicationModel for converted_student)
- Add serializer field `applications` — list of application summaries for the lead's student
- Add filters:
  - `flow_type` filter: LOCAL / ABROAD (based on application university country)
  - `has_applications` filter: boolean
  - `admission_paid` filter: boolean (any application with admission_fee_paid=True)
  - `source` filter (already exists)

**File: `operations/serializers.py` — `LeadDetailSerializer`**
- Add nested `applications` field showing:
  - Application ID, university name, courses, status, admission_fee_paid, created_at

### Phase 4: Frontend Admin — Enhance Leads page

**File: `src/app/(main)/admin/leads/page.tsx`**
- Add filter chips/tabs: All | Local | Abroad | App Students | Paid | Unpaid
- Show applications count badge on each lead card
- When clicking a lead, show their applications in the detail panel

**File: `src/app/(main)/admin/leads/[id]/page.tsx`**
- Add "Applications" section showing all applications for this student:
  - University name (linked to application detail)
  - Courses (badges)
  - Status (PENDING, APPROVED, etc.)
  - Admission fee: Paid ✓ / Unpaid (with "Send Payment Reminder" button)
  - Created date
- Keep existing: Contact Details, Sales Calls, Consultations, Notes

### Phase 5: Frontend Admin — Pipeline page adjustments

**File: Pipeline list page**
- Pipeline only shows students who have PAID admission fee
- Add a banner/link: "X students waiting to pay admission fee → View in Leads"
- Remove the "Create Application" button from lead detail (or change to "Send Payment Link")

### Phase 6: Handle existing data

**Management command or migration script:**
- For existing applications WITHOUT admission_fee_paid:
  - Check if they have a pipeline — if so, keep it (they're already in progress)
  - Create LeadModel entries for any app students not yet in leads
- For existing applications WITH admission_fee_paid:
  - Ensure pipeline exists (create if missing)

---

## Key Decisions

1. **What happens to existing pipelines?** Keep them — don't delete any in-progress work
2. **Can admin still force-create a pipeline?** Yes — admin "Create Application" from leads should still work, but only after confirming payment
3. **What if student pays via mobile money?** The payment webhook already updates PaymentModel.status → this triggers the new signal
4. **Multiple applications same student?** One lead, multiple applications visible. Each paid application gets its own pipeline.

---

## Files to Modify

| File | Change |
|------|--------|
| `operations/signals.py` | Remove auto-pipeline signal, add auto-lead signal, add payment→pipeline signal |
| `operations/views.py` | Update LeadViewSet with annotations/filters, update create_application |
| `operations/serializers.py` | Add applications to LeadDetailSerializer |
| `admin leads page.tsx` | Add filters, application count badges |
| `admin leads/[id] page.tsx` | Add Applications section with details |
| `admin pipeline list page.tsx` | Add "unpaid students" banner |
| Management command | Backfill leads for existing app students |
