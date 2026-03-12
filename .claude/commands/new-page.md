Create a new admin page with the standard Chuolink pattern.

Arguments: $ARGUMENTS (e.g., "leads" or "pipeline")

Steps:
1. Create the page directory: `src/app/(main)/admin/{name}/page.tsx`
2. Create a feature directory: `src/features/{name}/`
3. Follow the existing pattern:
   - 'use client' directive
   - PageContainer wrapper
   - Stat cards section with useQuery
   - Data table or main content below
   - Use `useClientApi()` for API calls
   - Use lucide-react icons
4. If the page needs a data table, create columns in `src/features/{name}/components/columns.tsx`
5. Add the route to the sidebar navigation in the relevant layout file
