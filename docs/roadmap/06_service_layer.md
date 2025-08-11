# 06. Service Layer & React Query

(Status: stub)

Objectives:

- Centralize data access, normalization, error translation.
- Prepare for React Query integration (caching policy matrix).

Deliverables:

1. PlaysDomainService (wrap existing playsService + canonicalization).
2. Error interpreter module (maps PostgREST/Supabase errors -> codes).
3. React Query hooks for plays: usePlays(playbookId), useCreatePlay().
4. Caching policy matrix doc (staleTime, gcTime per entity).

Adoption Criteria:

- 80% of play create/update paths call domain service.
- No direct supabase.from('plays') in UI components.

Next Steps:

1. Add domain service skeleton.
2. Replace one UI call site (pilot) & measure diff.
3. Expand to all create/update paths.
