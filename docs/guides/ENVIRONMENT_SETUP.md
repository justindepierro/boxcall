# Environment Setup Guide for Team Members

## Quick Setup:

1. Copy the template: `cp .env.example .env.local`
2. Fill in your local values in `.env.local`
3. Never commit `.env.local` to git

## What's in each file:

- `.env` - Safe, shareable config (committed)
- `.env.local` - Your sensitive keys (ignored by git)
- `.env.example` - Template for new team members

## Security Notes:

- Service role keys are now properly protected
- Client-side code only sees public anon key
- Server scripts use local service role key
