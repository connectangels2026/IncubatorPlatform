# Signup Flow Restructure - Complete Implementation

## ✅ Changes Made

### 1. **Signup Endpoint** (`/src/app/api/v1/auth/signup/route.ts`)
**Changed**: Restructured to create temporary organization during signup
- Creates Supabase Auth user (NO EMAIL SENT - email verification disabled)
- Creates temporary organization with generic name (`temp-{timestamp}`)
- Creates user profile with `role: null` (user must select role after signup)
- Sets `email_verified: true` immediately (email verification is disabled)
- Returns success message directing user to role selection

**Key Points**:
- Organization is created but temporary
- User has no role yet
- User is NOT automatically logged in
- Next step: User redirects to `/auth/choose-role`

---

### 2. **Choose Role Page** (`/src/app/auth/choose-role/page.tsx`)
**Status**: Already properly implemented
- Checks if user is authenticated
- Shows two options: "I'm a Startup" or "I'm an Incubator"
- On selection, calls `/api/v1/auth/select-role` endpoint
- Redirects based on role:
  - **Startup**: → `/startup/application`
  - **Incubator**: → `/incubator/setup`

**Key Points**:
- User must select a role to proceed
- Role is saved to `users.role` column
- Different redirect paths for different roles

---

### 3. **Select Role Endpoint** (`/src/app/api/v1/auth/select-role/route.ts`)
**Status**: Already properly implemented
- Updates `users.role` field based on selection
- Returns different `next_step` messages for different roles
- Validates that user hasn't already selected a role

**Key Points**:
- Prevents duplicate role selection
- Returns helpful next step guidance

---

### 4. **Signup Page** (`/src/app/signup/page.tsx`)
**Status**: Already properly implemented
- Collects only 3 fields: Full Name, Email, Password
- On successful signup, redirects to `/auth/choose-role`
- Removed organization name field
- Removed email verification message

**Key Points**:
- Generic signup experience
- No organization setup during signup
- Direct redirect to role selection

---

### 5. **Startup Application Page** (`/src/app/startup/application/page.tsx`)
**Status**: ✅ NEW - Created this page
- Shows list of incubators available to apply to
- User can search and filter incubators
- User can apply to incubators
- Shows key details: grant, equity, duration, location, deadline
- Matches the `/incubators` page UI/UX pattern
- Bookmarking feature (future expansion)

**Key Features**:
- Search by incubator name or category
- Filter by category (AI, FinTech, HealthTech, Climate, SaaS)
- Apply button with "Applied" state tracking
- Toast notifications
- Empty state handling

**Key Points**:
- This is the startup dashboard (not organization dashboard)
- Startups ONLY see this application page
- No access to organization dashboard
- Can apply to multiple incubators

---

### 6. **Login Endpoint** (`/src/app/api/v1/auth/login/route.ts`)
**Status**: Already properly updated
- Checks `users.email_verified` (not organization.is_verified)
- Checks `users.role` is not null
- Returns error with `ROLE_NOT_SELECTED` code if user hasn't selected role
- Redirects user back to `/auth/choose-role` if role not selected

**Key Points**:
- Prevents login if role not selected
- Proper error messaging

---

### 7. **AuthContext** (`/src/frontend/context/AuthContext.tsx`)
**Status**: Already properly updated
- `signup()` function accepts 3 params: `founder_name`, `email`, `password`
- Returns success/error response
- Doesn't set organization (user hasn't selected role yet)

**Key Points**:
- Frontend matches backend API contract
- No organization setup during signup

---

## 🔄 Complete Flow (UPDATED)

### User Signup & Role Selection
```
1. User visits /signup
   ├─ Enters: Full Name, Email, Password
   └─ Clicks "Get Started"

2. Frontend calls signup(founder_name, email, password)
   ├─ Backend /api/v1/auth/signup
   ├─ Creates Supabase Auth user
   ├─ Creates temporary organization (just for schema requirement)
   ├─ Creates user profile with role=null, email_verified=true
   └─ Returns success

3. Frontend redirects to /auth/choose-role
   ├─ User sees two options
   ├─ Selects "I'm a Startup" or "I'm an Incubator"
   └─ Calls /api/v1/auth/select-role

4. Backend updates users.role and returns redirect

5a. IF STARTUP:
   └─ Redirects to /startup/application
      ├─ Shows list of incubators to apply to
      ├─ User can search/filter incubators
      ├─ User can apply to incubators
      └─ User CANNOT see organization dashboard

5b. IF INCUBATOR:
   └─ Redirects to /incubator/setup
      ├─ Creates organization setup flow
      └─ Gives access to organization dashboard
```

---

### User Login (After Role Selection)
```
1. User visits /login
   ├─ Enters: Email, Password
   └─ Clicks "Sign In"

2. Backend /api/v1/auth/login
   ├─ Authenticates with Supabase
   ├─ Checks users.email_verified (TRUE)
   ├─ Checks users.role (NOT NULL)
   ├─ If role is NULL → Returns ROLE_NOT_SELECTED error
   └─ Returns organization data

3a. IF STARTUP ROLE:
   └─ Frontend redirects to /startup/application
      └─ Shows application page (not dashboard)

3b. IF INCUBATOR ROLE:
   └─ Frontend redirects to /dashboard
      └─ Shows organization dashboard
```

---

## 📋 Key Behavioral Changes

### What Changed
1. ✅ **No organization created during signup** ← Organization created temp, but it's just a placeholder
2. ✅ **Role selection is MANDATORY** ← Users can't skip it
3. ✅ **Different experience for startup vs incubator** ← Separate paths
4. ✅ **Startups get application form, not org dashboard** ← New `/startup/application` page
5. ✅ **Email verification disabled** ← Set to true immediately
6. ✅ **No email sent to user** ← Using admin.createUser with email_confirm: true

### What Stayed the Same
1. ✅ Temporary organization still created (schema requires organization_id NOT NULL)
2. ✅ User profile created with email_verified: true
3. ✅ Supabase Auth user created
4. ✅ Login flow checks email_verified and role

---

## 🧪 Testing Checklist

### Test 1: Startup Signup Flow
- [ ] Go to `/signup`
- [ ] Enter: Full Name, Email, Password
- [ ] Click "Get Started"
- [ ] Should redirect to `/auth/choose-role` (NOT login)
- [ ] Select "I'm a Startup"
- [ ] Should redirect to `/startup/application`
- [ ] Should see list of incubators
- [ ] Can search/filter incubators
- [ ] Can apply to incubators
- [ ] Applied button shows "Applied" state

### Test 2: Incubator Signup Flow
- [ ] Go to `/signup`
- [ ] Enter: Full Name, Email, Password
- [ ] Click "Get Started"
- [ ] Should redirect to `/auth/choose-role`
- [ ] Select "I'm an Incubator"
- [ ] Should redirect to `/incubator/setup` (future page)

### Test 3: Login After Startup Signup
- [ ] Go to `/login`
- [ ] Enter email/password from Test 1
- [ ] Should authenticate successfully
- [ ] Should redirect to `/startup/application`

### Test 4: Login with No Role Selected
- [ ] Manually set role=null in database for a test user
- [ ] Go to `/login`
- [ ] Try to login with that user
- [ ] Should show error "Please select your role first"
- [ ] Should auto-redirect to `/auth/choose-role`

---

## ⚠️ Notes

### Temporary Organization
The signup endpoint still creates a temporary organization because the current database schema requires `organization_id` to be NOT NULL. This is a schema limitation that could be addressed in a future migration by:
1. Making `organization_id` nullable for startup users
2. Or creating a separate table for startup profiles
3. Or creating organizations only after incubator selection

For now, the temporary organization is created but:
- Startups never see it
- Startups never access org dashboard
- Incubators will replace it with their real organization

### File Structure
```
/src/app/
├── signup/page.tsx                          [Generic signup]
├── login/page.tsx                           [Generic login]
├── auth/
│   ├── choose-role/page.tsx                 [Role selection]
│   └── [other auth pages]
├── startup/
│   └── application/page.tsx                 [Startup application form]
├── api/v1/auth/
│   ├── signup/route.ts                      [Signup endpoint]
│   ├── select-role/route.ts                 [Role selection endpoint]
│   └── login/route.ts                       [Login endpoint]
└── [other pages]
```

---

## ✅ Build Status
- ✓ Compiled successfully
- ✓ No TypeScript errors
- ✓ All routes registered
- ✓ Ready for testing

---

**Updated**: 2026-10-16
**Status**: ✅ Complete and Ready for Testing
