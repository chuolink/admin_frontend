---
name: chuolink-pipeline
description: >
  Helps implement Chuolink student processing pipeline features including the 16-stage
  journey from document collection to departure. Use this skill when working on pipeline
  models, Kanban boards, stage progress tracking, document verification, or any student
  processing workflow. Also use when creating Django models/serializers/views for pipeline
  stages or Next.js frontend components related to student application processing.
---

# Chuolink Student Processing Pipeline

## 16 Pipeline Stages

The student journey has two phases with 16 sequential stages:

### Pre-Application (Stages 1-7)

| # | Stage Key | Description | Required Documents |
|---|-----------|-------------|-------------------|
| 1 | `DOCUMENT_COLLECTION` | Gather initial documents | NECTA Form 4 & 6 certs, birth cert, NIDA, recommendation letters |
| 2 | `COURSE_SELECTION` | Determine best course with parent/student | None |
| 3 | `UNIVERSITY_SELECTION` | Choose university + present cost structure | None |
| 4 | `APPLICATION_SUBMISSION` | Submit application to university | Application form |
| 5 | `OFFER_LETTER` | Wait for university offer letter | Offer letter (received) |
| 6 | `ADMISSION_CONFIRMATION` | Parent pays admission fee → admission letter | Admission letter, payment receipt |
| 7 | `PASSPORT_APPLICATION` | Apply for travel passport | Birth cert, parent birth cert/affidavit, local gov letter, Form 4 cert, NIDA, passport photos, parent ID, admission letter |

### Post-Application (Stages 8-16)

| # | Stage Key | Description | Required Documents |
|---|-----------|-------------|-------------------|
| 8 | `POLICE_CLEARANCE` | Apply at MIA | Police clearance cert |
| 9 | `MEDICAL_EXAMINATION` | Medical checkup | Medical cert |
| 10 | `NOC_APPLICATION` | TCU No Objection Certificate | NOC cert |
| 11 | `BANK_STATEMENT` | Parent's bank statement | Bank statement |
| 12 | `EMBASSY_BOOKING` | Arrival card + booking | Embassy appointment confirmation |
| 13 | `VISA_APPLICATION` | Embassy visit and visa decision | Visa stamp/document |
| 14 | `FLIGHT_BOOKING` | Book flight ticket | Flight ticket |
| 15 | `ORIENTATION_SEMINAR` | Pre-departure briefing | None |
| 16 | `DEPARTURE` | Escort to airport | Boarding pass |

## Document Types

```
FORM_FOUR_CERT, FORM_SIX_CERT, FORM_SIX_LEAVING_CERT, RECOMMENDATION_LETTER,
BIRTH_CERT, NIDA, PASSPORT_PHOTO, PARENT_ID, PARENT_BIRTH_CERT, AFFIDAVIT,
LOCAL_GOV_LETTER, ADMISSION_LETTER, OFFER_LETTER, POLICE_CLEARANCE, MEDICAL_CERT,
NOC_CERT, BANK_STATEMENT, VISA, FLIGHT_TICKET, OTHER
```

## Backend Model Pattern

When creating pipeline-related Django models, use:

- **CuidField** primary key with appropriate prefix (e.g., `prefix='pipeline_'`)
- **BaseViewSet** from `app/utils/filter_backend.py`
- **StandardResultsSetPagination** for list endpoints
- **InAdminGroup** permission for admin endpoints
- **InConsultantGroup** for consultant-scoped endpoints (filter by `assigned_consultant`)

### Key Models to Create

1. **StudentPipelineModel** — OneToOne with StudentModel, tracks current phase and assigned staff
2. **PipelineStageModel** — FK to pipeline, tracks each of the 16 stages with status
3. **DocumentRequirementModel** — FK to stage, tracks document upload/verification
4. **PaymentStageModel** — FK to pipeline, tracks stage-related payments

### Stage Status Flow
```
NOT_STARTED → IN_PROGRESS → COMPLETED
                          → BLOCKED
                          → SKIPPED
```

### Pipeline Phase Flow
```
CONSULTATION → PRE_APPLICATION → POST_APPLICATION → ORIENTATION → DEPARTED → MONITORING
```

## Frontend Components

### Pipeline Kanban Board (`/admin/pipeline`)
- Board columns = pipeline stages (or grouped by phase)
- Student cards showing: name, university, current stage, consultant, days-in-stage
- Filters: consultant, phase, university, country
- Use existing `@dnd-kit` setup from `src/features/kanban/`

### Student Pipeline Detail (`/admin/pipeline/[studentId]`)
- Progress bar showing all 16 stages (completed/current/upcoming)
- Document checklist for current stage with upload/verify actions
- Payment schedule with status
- Activity timeline
- Assigned staff info

### Document Verification Queue (`/admin/documents`)
- Table of pending document verifications
- Quick approve/reject with reason
- Filter by stage, student, document type

## API Endpoints Pattern

```
/api/v1/admin/pipelines/                    # List/Create pipelines
/api/v1/admin/pipelines/{id}/               # Retrieve/Update pipeline
/api/v1/admin/pipelines/{id}/stages/        # List stages for a pipeline
/api/v1/admin/pipeline-stages/{id}/         # Update stage status
/api/v1/admin/documents/                    # List all documents (verification queue)
/api/v1/admin/documents/{id}/verify/        # Verify/reject document
/api/v1/consultant/pipelines/               # Consultant's assigned pipelines
```
