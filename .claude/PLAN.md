# Chuolink Admin — Operations Management System

## Vision

Transform the admin dashboard into the **central operations management system** for Chuolink. The system supports the full business lifecycle:

**Lead Acquisition → Consultation → Pre-Application → Post-Application → Departure → Monitoring**

All staff use this system for day-to-day operations.

## Backend Integration

- Backend location: `/Users/mac/Projects/collab/chuolink/backend_new`
- Start backend: `cd /Users/mac/Projects/collab/chuolink/backend_new && python manage.py runserver`
- Schema URL: `http://127.0.0.1:8000/api/v1/schema/`
- **Generate types**: Backend must be running at port 8000, then `bun run generate`
- This updates `src/lib/api/schema.d.ts` with all typed endpoints

## Organizational Roles

| Role | Permission Group | Access |
|------|-----------------|--------|
| CEO | admin | Full — vision, marketing, finances |
| COO | admin | Operations — scheduling, delegation, tracking |
| CTO | admin | Technical — app, database, debugging |
| Admission Manager | manager | Student pipeline — documents, passport, visa |
| Content Creator | content | Marketing content, social media, notifications |
| DB/Research Admin | manager | Course/university data, scholarships |
| Consultant | consultant | Client-facing — consultations, sales calls, assigned students |

## Phases

### Phase 1: Infrastructure + Styling ✅
- shadcn-admin OKLCH slate theme
- Layout upgrade (NavGroup sidebar, scroll shadow header, content wrapper)
- Data table components (pagination, filters, column header, toolbar, view options)
- `.claude/rules/`, project config

### Phase 2: CRM — Leads, Sales & Consultations
- Lead management (sources: school visits, online, office, calls, referrals, social media)
- Sales call tracking per staff member
- Consultation scheduling and outcomes
- Activity logging
- Lead → Student conversion funnel

### Phase 3: Student Processing Pipeline
16 stages from pre-application to departure:

**Pre-Application:**
1. Document Collection (NECTA certs, birth cert, NIDA, recommendation letters)
2. Course Selection
3. University Selection + cost structure
4. Application Submission
5. Offer Letter
6. Admission Confirmation (payment → admission letter)
7. Passport Application

**Post-Application:**
8. Police Clearance (MIA)
9. Medical Examination
10. NOC Certificate (TCU)
11. Bank Statement
12. Embassy Booking (arrival card, university notification, visit day)
13. Visa Application
14. Flight Booking
15. Orientation Seminar
16. Departure

### Phase 4: Dashboards & Monitoring
- Operational metrics (pipeline funnel, conversion rates, revenue)
- Action items (pending verifications, overdue payments, stuck students)
- Consultant performance tracking
- Monitoring alerts

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (new-york, slate)
- **Backend**: Django 5 + DRF, drf_spectacular (OpenAPI)
- **State**: TanStack React Query, Zustand
- **API**: openapi-fetch + openapi-react-query (typed from schema)
- **Auth**: NextAuth v4 + Keycloak
- **Package Manager**: bun
