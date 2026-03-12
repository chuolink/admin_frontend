# Implementation Progress

## Phase 1 — Infrastructure + Styling
- [x] `.claude/rules/project.md`
- [x] `.claude/rules/backend.md`
- [x] `.claude/settings.json` with hooks
- [x] `globals.css` → shadcn-admin OKLCH slate palette
- [x] `theme.css` → simplify (remove multi-theme variants)
- [x] `font.ts` → add Manrope font
- [x] `components.json` → new-york, slate, lucide
- [x] `header.tsx` → scroll shadow + backdrop blur
- [x] `main.tsx` → new content wrapper component
- [x] `app-sidebar.tsx` → NavGroup pattern refactor
- [x] `admin/layout.tsx` → new grouped nav structure
- [x] `consultant/layout.tsx` → updated nav
- [x] `data-table/*` → 5 new reusable components (column-header, pagination, faceted-filter, toolbar, view-options)
- [x] `sidebar.tsx` → cleaned up old navigation rendering, standard children pattern
- [x] `layout.tsx` → removed ActiveThemeProvider, multi-theme class logic
- [x] Build passes (`bun run build`)
- [ ] Visual check (dark/light mode matches shadcn-admin)

## Phase 2 — CRM
- [ ] Backend: LeadModel, SalesCallModel, ConsultationModel, ActivityLogModel
- [ ] Backend: Serializers + ViewSets + URLs
- [ ] `bun run generate` for new types
- [ ] `/admin/leads` page
- [ ] `/admin/sales-calls` page
- [ ] `/admin/consultations` page
- [ ] `/consultant/leads` page
- [ ] `/consultant/sales-calls` page

## Phase 3 — Student Processing Pipeline
- [ ] Backend: StudentPipelineModel, PipelineStageModel, DocumentRequirementModel, PaymentStageModel
- [ ] Backend: Serializers + ViewSets + URLs
- [ ] `bun run generate` for new types
- [ ] `/admin/pipeline` Kanban board
- [ ] `/admin/pipeline/[studentId]` detail with 16-stage progress
- [ ] `/admin/documents` verification queue
- [ ] Enhanced `/admin/students/[id]` detail page
- [ ] `/consultant/pipeline` + detail pages

## Phase 4 — Dashboards & Monitoring
- [ ] Admin overview redesign with operational metrics
- [ ] Action items panel (pending verifications, overdue, stuck students)
- [ ] Consultant overview redesign
- [ ] Monitoring alerts for stuck students (>X days in stage)
