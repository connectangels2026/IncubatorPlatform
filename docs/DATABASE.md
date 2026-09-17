# Database Configuration

## Connection Details

| Setting | Value |
|---------|-------|
| Project Name | arba-incubator |
| Organization | incubator-platform |
| Project URL | https://knucyiahztcpqgsftiyc.supabase.co |
| Region | ap-northeast-2 |
| Database | postgres |

## Environment Variables

Copy these to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
DATABASE_URL=postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Credentials

**⚠️ KEEP THESE SECRET! Never commit to git!**

- Anon Key: Used in frontend (safe to expose)
- Service Role Key: Used in backend (KEEP SECRET)
- Database Password: KEEP SECRET

## Tables (13 Total)

1. organizations
2. users
3. user_roles
4. startups
5. applications
6. evaluation_criteria
7. evaluations
8. mentors
9. mentorship_sessions
10. startup_reviews
11. documents
12. notifications
13. tasks

## RLS Policies

All tables have Row-Level Security enabled:
- Users see only their organization's data
- Founders see only their own startups
- Admins can manage users
- Mentors can view startups in their org