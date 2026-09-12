# ARBA Accelerator Platform - Complete UI & Field Reference

## Tech Stack

- **Framework:** React 19 + Next.js 16 (App Router, client-side pages)
- **Styling:** Tailwind CSS 4 with shadcn/ui components
- **Language:** TypeScript
- **Icons:** Lucide React
- **Backend:** None — forms only `console.log()` on submit, no database, no API

---

## Page: Home (`/`)

- **Sticky navbar** with logo "Incubator" and links: Features, Programs, Get Started
- **Hero section:** Headline "Turn Your Ideas Into Reality", subtitle, two CTAs ("Join Now" links to `/programs`, "Learn More" scrolls to programs section)
- **Stats bar:** 500+ Startups, $50M+ Funding, 95% Success Rate, 150+ Mentors
- **Features section (6 cards):** Idea Validation, Network Access, Growth Support, Funding Ready, Fast Track, Success Proven
- **Programs section (2 cards):** Pre-Incubator (₹6,500, 1 year) and Incubator (₹60K-₹1.2L, 1 year, "POPULAR" badge)
- **Success Stories (3 cards):** TechVenture, EcoStart, DataFlow with metrics
- **CTA section:** "Ready to Start Your Journey?" with button to `/programs`
- **Footer:** Quick links, program links, contact (hello@incubator.com, +1 555 123-4567)

---

## Page: Programs (`/programs`)

- **Navbar** with back arrow + logo
- **Two clickable cards:** Pre-Incubator and Incubator (with "MOST POPULAR" badge)
- **Comparison table** with 18 rows comparing features side-by-side (duration, cost, mentorship, funding, legal support, etc.)
- **Card detail view:** When you click a program, it expands to show full details (features list, ideal-for list, duration, cohort size, investment) with "Apply Now" button linking to the actual form

---

## Page: Pre-Incubator Form (`/programs/preincubator`)

**14 sections, ~100 fields total. No file upload field.**

### Section 1 — Founder Information

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Full Name | Text input | Yes | Min 2, Max 100 chars |
| Email Address | Email input | Yes | Regex validated |
| Phone / WhatsApp Number | Text input | Yes | International format validated |
| Current Location | Select | Yes | UAE, India, GCC, Other |
| Current Professional Status | Select | Yes | Student, Employed, Entrepreneur, Freelancer/Consultant, Family Business, Looking to start a business, Other |
| Professional/Business Experience | Select | Yes | 0-2 yrs, 3-5 yrs, 6-10 yrs, 10+ yrs |
| Have you previously started or managed a business? | Select | Yes | No, Yes currently operating, Yes previously operated, Yes multiple businesses |
| Primary reason for joining ARBA Accelerator | Checkbox (max 3) | Yes | 12 options: idea, validate, started, customers, model, funding, strategic, operational, scale, market, tech, professional |

### Section 2 — Business Stage

| Field | Type | Required |
|-------|------|----------|
| Which stage best describes your business? | Select | Yes — Idea, Validation, MVP, Early Revenue, Growth, Scaling, Mature |
| When did you start working on this business? | Month picker | Yes |
| Is the business legally registered? | Select | Yes — Yes, No, In process, Not required yet |
| Where is the business currently operating? | Text input | Yes |
| What industry/category? | Text input | Yes, max 100 chars |
| Describe your business in one sentence | Text input | Yes, 10-200 chars |
| Explain your business in simple terms | Textarea | Yes, 20-1000 chars |

### Section 3 — The Problem

| Field | Type | Required |
|-------|------|----------|
| What problem are you solving? | Textarea | Yes, 20-1000 chars |
| Who experiences this problem? | Textarea | Yes, 20-1000 chars |
| How are people currently solving this problem? | Textarea | Yes, min 20 chars |
| Why is the existing solution inadequate? | Textarea | No |
| How important is this problem? | Radio (1-5 scale) | Yes |
| What evidence do you have that this problem exists? | Checkbox | Yes — interviews, sales, surveys, research, competitors, personal, industry, no validation |

### Section 4 — Your Solution

| Field | Type | Required |
|-------|------|----------|
| What exactly are you offering? | Textarea | Yes, 20-1000 chars |
| What makes your solution different? | Textarea | Yes, min 20 chars |
| Why would customers choose you instead of an existing alternative? | Textarea | No |
| Strongest competitive advantage | Checkbox | Yes — Price, Technology, IP, Distribution, Brand, Expertise, Experience, Network, Speed, Model |
| Is your product/service already available? | Select | Yes — Yes, Prototype, MVP, Under development, Not yet |
| Website/social media/demo link | URL input | No |

### Section 5 — Customer & Market

| Field | Type | Required |
|-------|------|----------|
| Who is your ideal customer? | Textarea | Yes, 20-1000 chars |
| Who is your primary paying customer? | Text input | No, min 10 chars |
| How large is your target market? | Text input | Yes |
| Which geographic market are you targeting? | Checkbox | Yes — UAE, India, GCC, Middle East, Asia, Europe, USA, Global |
| Who are your top 3 competitors? | Textarea | Yes, 20-1000 chars |
| What do your competitors do better than you? | Textarea | No |
| What do you believe you can do better? | Textarea | No |
| Why is now the right time? | Textarea | No |

### Section 6 — Traction

| Field | Type | Required |
|-------|------|----------|
| Do you currently have customers? | Select | Yes — No, 1-10, 11-50, 51-100, 100+ |
| How many paying customers served so far? | Number input | No |
| Revenue during last 12 months? | Select | No — ₹0, Under ₹1L, ₹1-5L, ₹5-25L, ₹25L-₹1Cr, ₹1-5Cr, ₹5Cr+, Prefer not to disclose |
| Revenue in last 3 months? | Text input | No |
| Is revenue currently growing? | Select | Yes — Yes rapidly, Yes steadily, Flat, Declining, No revenue yet |
| Average transaction/customer value? | Text input | No |
| How do you acquire customers? | Checkbox | Yes — referrals, social, paid ads, sales team, partnerships, marketplace, networking, founder network, organic search |
| Biggest customer acquisition challenge? | Textarea | No |

### Section 7 — Business Model

| Field | Type | Required |
|-------|------|----------|
| How does your business make money? | Textarea | Yes, 20-1000 chars |
| What are your current revenue streams? | Textarea | No |
| Gross margin? | Text input | No |
| Major monthly expenses? | Textarea | No |
| Current monthly burn? | Text input | No |
| Is the business currently profitable? | Select | Yes — Yes, No, Break-even, Too early to determine |
| Biggest financial challenge? | Select | Yes — Revenue, Cash flow, Pricing, Cost management, Funding, Working capital, Profitability, Do not know |

### Section 8 — Founder Readiness

| Field | Type | Required |
|-------|------|----------|
| Hours per week you can dedicate | Select | Yes — <5, 5-10, 10-20, 20-40, Full-time 40+ |
| Working full-time on this business? | Select | Yes — Yes, No |
| If not full-time, what prevents you? | Textarea | Conditional (shown if "No") |
| How committed are you (next 12 months)? | Range slider 1-10 | Yes |
| How comfortable with uncertainty/risk? | Range slider 1-10 | Yes |
| How willing to change idea based on feedback? | Range slider 1-10 | Yes |
| Which statement describes you best? | Radio | Yes — 6 options from "need someone to tell me" to "unsure what business needs" |
| Biggest personal challenge affecting business? | Textarea | No |
| Biggest business challenge affecting growth? | Textarea | Yes, min 10 chars |

### Section 9 — Team

| Field | Type | Required |
|-------|------|----------|
| Who are the founders? (Name, Role, Experience, Expertise) | Textarea | Yes, 10-1000 chars |
| How many people currently work in the business? | Number input | Yes |
| What key skills are missing from your team? | Checkbox | Yes — Sales, Marketing, Technology, Finance, Operations, Product, HR, Leadership, Legal, Fundraising, Industry expertise |
| Are you looking for co-founders? | Select | Yes — Yes, No, Maybe |

### Section 10 — Funding & Investment

| Field | Type | Required |
|-------|------|----------|
| Have you raised external funding? | Checkbox | No — No, Friends/family, Angel, VC, Bank loan, Government, Other |
| How much capital invested personally? | Text input | No |
| Are you currently seeking funding? | Select | Yes — No, Yes, Maybe in future |
| If yes: How much funding seeking? | Text input | Conditional (if "Yes") |
| If yes: What will funding be used for? | Checkbox | Conditional — Product dev, Hiring, Marketing, Sales, Technology, Inventory, Expansion, Working capital |
| Are you investment-ready? | Select | Yes — Yes, No, I do not know |

### Section 11 — Incubation Requirements

| Field | Type | Required |
|-------|------|----------|
| Top 3 things you want ARBA to help achieve | Textarea | Yes, 20-1000 chars |
| Which areas need most support? (Rank top 5) | Checkbox (max 5) | Yes — 19 options (model, validation, research, product, branding, marketing, sales, acquisition, pricing, financial, fundraising, technology, operations, hiring, leadership, legal, expansion, partnerships, investor readiness) |
| What would success look like after 90 days? | Textarea | Yes, 20-1000 chars |
| What would success look like after 12 months? | Textarea | Yes, 20-1000 chars |
| If ARBA could solve one problem, what should it be? | Textarea | No |

### Section 12 — Founder Mindset

All fields are **Radio 1-5 scale** (Strongly Disagree to Strongly Agree), all required:

1. I actively seek customer feedback
2. I am willing to change my business model when evidence suggests
3. I take responsibility when something does not work
4. I am comfortable receiving critical feedback
5. I consistently execute rather than only plan
6. I understand my business numbers
7. I know who my ideal customer is
8. I understand my competitors
9. I have clearly defined business goals
10. I can dedicate sufficient time to execution
11. I am willing to be held accountable for agreed milestones

### Section 13 — Reality Check

| Field | Type | Required |
|-------|------|----------|
| Biggest reason your business might fail? | Textarea | Yes, 20-1000 chars |
| Assumption you are least certain about? | Textarea | Yes, 20-1000 chars |
| What have you tried that did not work? | Textarea | No |
| Biggest mistake you have made so far? | Textarea | No |
| What are you currently avoiding doing? | Textarea | No |
| If you had to shut down tomorrow, most likely reason? | Textarea | No |
| Why should ARBA Accelerator select you? | Textarea | Yes, 20-1000 chars |
| What will you do differently if accepted? | Textarea | No |

### Section 14 — Final Founder Statement

| Field | Type | Required |
|-------|------|----------|
| In 100 words or less: Why do you want to build this business? | Textarea | Yes, 20-500 chars |
| In one sentence: What do you want ARBA to help you become? | Text input | Yes, 10-200 chars |

---

## Page: Incubator Form (`/programs/incubator`)

**7 sections, ~35 fields total. No file upload field.**

### Section 1 — Idea Evaluation

| Field | Type | Required |
|-------|------|----------|
| Business Name | Text input | Yes, 2-100 chars |
| Business Description | Textarea | Yes, 30-1000 chars |
| Problem Solved | Textarea | Yes, min 20 chars |
| Target Market | Textarea | Yes, min 20 chars |
| Business Stage | Select | Yes — MVP, Early Revenue, Growth, Scaling |
| How have you validated this idea? | Checkbox | Yes — Customer interviews, Surveys, Landing page validation, MVP with real users, Early revenue, Strategic partnerships |

### Section 2 — Market Fit Validation

| Field | Type | Required |
|-------|------|----------|
| Customer Problems | Textarea | Yes, min 20 chars |
| Current Customer Solutions | Textarea | Yes, min 20 chars |
| Product-Market Fit Status | Select | Yes — Still exploring, Developing fit, Validating fit, Strong fit achieved |
| Customer Feedback | Textarea | Yes, min 20 chars |
| Market Research Methods Used | Checkbox | Yes — Interviews, Surveys, Analytics, Competitor analysis, Industry reports, Focus groups |

### Section 3 — Scalability Validation

| Field | Type | Required |
|-------|------|----------|
| Scalability Plan | Textarea | Yes, min 30 chars |
| Scaling Challenges | Textarea | Yes, min 20 chars |
| Resources Needed for Scaling | Textarea | Yes, min 20 chars |
| Growth Projection | Textarea | Yes, min 20 chars |
| Key Scalability Metrics | Select | Yes — User growth, Revenue growth, Retention rate, CAC, LTV, Operational efficiency |

### Section 4 — Product Validation

| Field | Type | Required |
|-------|------|----------|
| Current Product Status | Select | Yes — Concept/Prototype, Beta version, Live with early users, Production ready |
| Key Product Features | Textarea | Yes, min 20 chars |
| Product Differentiation | Textarea | Yes, min 20 chars |
| User Testing & Feedback | Textarea | Yes, min 20 chars |
| Product Roadmap | Textarea | Yes, min 20 chars |

### Section 5 — Business Model Validation

| Field | Type | Required |
|-------|------|----------|
| Revenue Model | Textarea | Yes, min 20 chars |
| Customer Acquisition Cost (CAC) | Text input | Yes, min 5 chars |
| Customer Lifetime Value (LTV) | Text input | Yes, min 5 chars |
| Profitability Timeline | Select | Yes — Already profitable, Within 6 months, Within 1 year, Within 2 years, 3+ years |
| Business Model Validation | Textarea | Yes, min 20 chars |

### Section 6 — Financial Projection

| Field | Type | Required |
|-------|------|----------|
| Projected Revenue (6 Months) | Text input | Yes, min 5 chars |
| Projected Revenue (12 Months) | Text input | Yes, min 5 chars |
| Funding Required | Text input | Yes, min 5 chars |
| How will you use the funding? | Checkbox | Yes — Product development, Hiring and team, Marketing and sales, Operations and infrastructure, Working capital, Geographic expansion |
| Financial Assumptions | Textarea | Yes, min 20 chars |

### Section 7 — Founder Skills Validation

| Field | Type | Required |
|-------|------|----------|
| Founder Background | Textarea | Yes, min 20 chars |
| Relevant Expertise | Textarea | Yes, min 20 chars |
| Team Composition | Textarea | Yes, min 20 chars |
| Key Skills You Need to Develop | Checkbox | Yes — Sales, Marketing, Product management, Finance, Operations, Technology, Leadership |
| Leadership Experience | Textarea | Yes, min 20 chars |

---

## Success / Thank-You Pages

Both forms show a **SubmissionSuccess** component after submit:

### Pre-Incubator Success

- Green checkmark icon
- "Application Submitted Successfully!"
- "Thank you for completing the ARBA Accelerator Pre-Incubator Prerequisite Questionnaire"
- Next steps: evaluation within 7 business days, contact if selected, detailed feedback
- "Back to Home" button links to `/`
- Tagline: "ARBA Accelerator - Building Tomorrows Leaders Today"

### Incubator Success

- Same layout
- "Thank you for submitting your Incubator Program Application"
- Next steps: evaluation within 5-7 business days, interview if selected, 6-month incubation
- Tagline: "ARBA Accelerator - Building Tomorrow Leaders Today"

---

## Admin / Dashboard Page

**Does not exist.** There is no admin panel, dashboard, or any authenticated routes. The `incubator-platform/` directory is empty (only a `.next` build folder).

---

## File Uploads

**None.** The Pre-Incubator form has a `documents: File | null` field in the TypeScript interface but it is **never rendered** in the UI — no file input exists in any form. All fields are text, textarea, select, checkbox, radio, or range slider.

---

## Key Technical Notes

- All forms are `'use client'` — fully client-side rendered
- Data goes nowhere on submit — just `console.log("Form submitted:", formData)`
- No form persistence (no localStorage, no session, no database)
- Pre-Incubator form components (FormInput, FormTextarea, etc.) are **duplicated** in both form files — not shared
- The preincubator page has `LayoutProps<"/">` type annotation in layout.tsx (Next.js 16 feature)
- Validation is per-step with inline error messages and an amber warning box

---

## File Structure

```
Incubator_Form/
├── src/
│   ├── app/
│   │   ├── layout.tsx              (Root layout, Geist fonts, metadata)
│   │   ├── page.tsx                (Home page - 343 lines)
│   │   ├── globals.css             (Tailwind + shadcn theme - 131 lines)
│   │   └── programs/
│   │       ├── page.tsx            (Program selector + comparison table - 367 lines)
│   │       ├── preincubator/
│   │       │   └── page.tsx        (14-step form - 2112 lines)
│   │       └── incubator/
│   │           └── page.tsx        (7-step form - 1126 lines)
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx          (shadcn Button component - 58 lines)
│   └── lib/
│       └── utils.ts                (cn() utility - 6 lines)
├── package.json
├── tsconfig.json
└── postcss.config.mjs
```
