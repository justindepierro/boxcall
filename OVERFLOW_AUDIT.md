# Overflow Clipping Audit - October 11, 2025

## Update: Partial Success ✅

### What's Working:

- ✅ **Confidence badges now fully visible** (70% circular indicators show completely)
- ✅ Backdrop-blur removal successful

### Remaining Issues:

1. **"Weird borders" around buttons** - Location unknown, need user confirmation
2. **Diagram button shadow still clipped** - Despite py-16 padding

## Latest Changes

### Shadow Clipping Fix Attempt:

- Increased hero tiles padding from `py-8` to `py-16` (64px vertical padding)
- Reasoning: `shadow-2xl` requires 50px clearance
- Status: **Testing required**

## Diagnostic Needed

Please help identify the "weird borders" issue:

1. **Where** are they? (Quick Filters? Hero tiles? Play cards?)
2. **What color**? (Green/jade? Blue? Gray?)
3. **When** visible? (Always? Hover? Focus? Active?)

Can you right-click and "Inspect Element" on one of the bordered elements?
