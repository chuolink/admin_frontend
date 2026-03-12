Create a new Django model with the standard Chuolink pattern.

Arguments: $ARGUMENTS (e.g., "Lead" or "SalesCall")

Backend location: `/Users/mac/Projects/collab/chuolink/backend_new`

Steps:
1. Create model in `app/models/` with CuidField primary key and prefix
2. Create serializer in `app/serializers/`
3. Create ViewSet in `app/views/` using BaseViewSet
4. Register in `app/urls.py` router
5. Run migrations: `cd /Users/mac/Projects/collab/chuolink/backend_new && python manage.py makemigrations && python manage.py migrate`
6. Restart backend if needed
7. Regenerate frontend types: `bun run generate`
