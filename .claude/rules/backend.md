# Backend Rules (Django + DRF)

## Location
`/Users/mac/Projects/collab/chuolink/backend_new`

## Patterns
- **ViewSets**: Use `BaseViewSet` from `app/utils/filter_backend.py`
- **Pagination**: `StandardResultsSetPagination` (page-based)
- **Filters**: `DjangoFilterBackend`, `SearchFilter`, `OrderingFilter`
- **Permissions**: `InAdminGroup`, `InConsultantGroup` from `app/utils/permissions.py`
- **IDs**: CuidField with prefixes (e.g., `prefix='student_'`, `prefix='lead_'`)
- **OpenAPI**: drf_spectacular at `/api/v1/schema/`

## Key Models (existing)
- `StudentModel` (prefix='student_') — user, education_level, balance, earnings
- `UniversityApplicationModel` (prefix='university_application_') — student, university, status, app_id
- `PaymentModel` (prefix='payment_') — user, student, amount, mode, status
- `ConsultantModel` (prefix='consultant_') — user, payment info, earnings
- `ParentModel` (prefix='parent_') — student, name, phone, email
- `ApplicationExtraDocumentsModel` — application documents
- `ApplicationProgressModel` — application progress tracking
- `ApplicationCredentialsModel` — university portal credentials

## Application Statuses
PENDING → APPROVED → ADMITTED → SUBMITTED → (FULL_PAID)
Or: CANCELLED | REJECTED | REVOKED | EXPIRED

## Reusing Endpoints (IMPORTANT)
- **Always reuse existing `app/` endpoints** before creating new admin-specific ones
- The `app/` module has full CRUD for: universities (`/university/`), courses (`/course/`), course-university offerings (`/course_university/`), countries (`/country/`), students (`/student/`), etc.
- These are `IsAuthenticated` — admin users can access them too
- Only create admin-specific endpoints when you need: admin-only permissions, different serializer fields, custom actions, or aggregated data
- For search/picker UIs, prefer the existing `app/` endpoints — they already have `search_fields` configured
- Use lightweight admin serializers only when the `app/` serializer is too heavy (e.g., `depth=2` with nested eligibility checks)

## Creating New Models
1. Add to `app/models/` with CuidField primary key
2. Create serializer in `app/serializers/`
3. Create ViewSet in `app/views/` using BaseViewSet
4. Register in `app/urls.py` router
5. Run `python manage.py makemigrations && python manage.py migrate`
6. Regenerate schema: `python manage.py spectacular`
7. Frontend: `bun run generate` to update types
