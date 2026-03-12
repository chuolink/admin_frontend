Generate OpenAPI types from the backend. Backend must be running at port 8000.

Steps:
1. Check if backend is running: `curl -s http://127.0.0.1:8000/api/v1/schema/ | head -c 100`
2. If not running, start it: `cd /Users/mac/Projects/collab/chuolink/backend_new && python manage.py runserver &`
3. Wait for it to be ready, then run: `bun run generate`
4. This updates `src/lib/api/schema.d.ts` with all typed endpoints
