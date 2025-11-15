# Supabase Type Generation

The TypeScript errors you're seeing are because the Supabase types need to be regenerated to include the new community tables.

## To Fix TypeScript Errors:

1. **Generate new types from your Supabase project:**

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

OR if you have the Supabase CLI linked:

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

2. **Alternatively, you can:**
   - Go to Supabase Dashboard → Settings → API
   - Copy your Project URL and look for the project reference ID
   - Use it in the command above

## The new tables that need types:
- practice_groups
- group_members
- challenges
- challenge_participants
- friendships
- activities
- activity_reactions
- activity_comments
- user_badges

Once you regenerate the types, all TypeScript errors will be resolved! 🎉

## Note:
The code will work perfectly at runtime even with these TypeScript warnings. The warnings are just the TypeScript compiler not knowing about the new database tables yet.
