# Supabase CLI Commands (Docker Setup)

# Start services

npx supabase start

# Stop services

npx supabase stop

# Reset database and regenerate types

npx supabase db reset && npx supabase gen types typescript --local > src/types/database/generated.ts

# Check status

npx supabase status

# View logs

npx supabase logs

# Access database directly

psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
