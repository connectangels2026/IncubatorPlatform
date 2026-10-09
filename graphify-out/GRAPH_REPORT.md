# Graph Report - Incubator-WebApp  (2026-10-09)

## Corpus Check
- 303 files · ~245,483 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 102 file(s) not represented in the graph (top: .ttf 54, .csv 39, (none) 4)

## Summary
- 2975 nodes · 5161 edges · 201 communities (146 shown, 55 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89cd1674`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- next
- ShadcnInstaller
- react
- handleApiError
- gray
- test_sync_brand_to_tokens.py
- json
- taskService.ts
- app/dashboard/page.tsx
- Tailwind CSS Utility Reference
- UI/UX Pro Max - Design Intelligence
- Brand Guidelines v1.0
- Design
- logo/generate.py
- slide_search_core.py
- Canvas Design System
- Page: Pre-Incubator Form (`/programs/preincubator`)
- mentors/page.tsx
- spacing
- Form & Input Components
- Tailwind CSS Responsive Design
- DesignSystemGenerator
- requireOrg
- Typography Specifications
- TestTailwindConfigGenerator
- html-token-validator.py
- shadcn/ui Accessibility Patterns
- notificationService.ts
- Button
- Logo Usage Rules
- Component Specifications
- super-admin/Sidebar.tsx
- object
- preincubator/page.tsx
- Asset Approval Checklist
- Logo AI Prompt Engineering
- UI Styling Skill
- tenant.ts
- Color Palette Management
- CIP Deliverable Guide
- States and Variants
- Workflow
- Design System
- TailwindConfigGenerator
- Tailwind CSS Customization
- package.json
- icon/generate.py
- generate-slide.py
- frontend/context/AuthContext.tsx
- compilerOptions
- Routing by Task Type
- fetch-background.py
- shadcn/ui Theming & Customization
- incubator/page.tsx
- Asset Organization Guide
- Primary Color Meanings
- Core Logo Types
- color
- Brand Consistency Checklist
- CIP Mockup Prompt Engineering
- Color Semantics
- lucide-react
- startup-reviews/[id]/route.ts
- Design Principles
- Design Principles
- fontSize
- dependencies
- extract-colors.cjs
- CIP Design Reference
- Icon Design Reference
- Copywriting Formulas
- cip/core.py
- Copywriting Formulas
- documents/[id]/route.ts
- Banner Design - Multi-Format Creative Banner System
- Messaging Framework
- Brand Voice Framework
- sync-brand-to-tokens.cjs
- validate-asset.cjs
- Layout Patterns
- Tailwind Integration
- Layout Patterns
- evaluation-criteria/[id]/route.ts
- update.md
- Logo Design Reference
- logo/core.py
- Token Architecture
- design-tokens-starter.json
- scripts/core.py
- render-html.py
- Primitive Tokens
- embed-tokens.cjs
- validate-tokens.cjs
- card
- Core Visual Elements
- inject-brand-context.cjs
- Brand
- CIP Design Style Guide
- duration
- StartupService
- Slide Strategies
- Component Tokens
- generate-tokens.cjs
- button
- Slide Strategies
- feedback/route.ts
- BM25
- BM25
- BM25
- TestGeneratedConfigIsValidJs
- BM25
- SimpleLayout.tsx
- availability/route.ts
- input
- radius
- ARBA Accelerator
- incubators/page.tsx
- mentorship-sessions/[id]/route.ts
- Event
- Slides Reference
- HTML Slide Template
- logo/search.py
- HTML Slide Template
- Slides
- design_system.py
- @supabase/supabase-js
- sm
- devDependencies
- evaluations/route.ts
- action-points/route.ts
- notifications/[id]/route.ts
- csv/route.ts
- lib/apiClient.ts
- Brand Guidelines Template
- $type
- radius
- lg
- evaluations/[id]/route.ts
- os
- scripts
- score/route.ts
- padding-y
- xl
- complete/route.ts
- none
- Database Configuration
- utils.ts
- destructive
- destructive-foreground
- muted
- primary-foreground
- ring
- secondary-foreground
- validation.ts
- test_tasks.mjs
- AGENTS.md
- slides-create.md
- create.md
- postcss.config.mjs
- admin/index.ts
- co_incubations/models/index.ts
- co_incubations/routes/index.ts
- collaborators/routes/index.ts
- events/routes/index.ts
- notifications/index.ts
- payments/index.ts
- reports/index.ts
- app/page.tsx
- 16
- 1
- 3
- 8

## God Nodes (most connected - your core abstractions)
1. `handleApiError()` - 180 edges
2. `verifyAuth()` - 178 edges
3. `requireOrg()` - 161 edges
4. `next` - 121 edges
5. `react` - 71 edges
6. `TailwindConfigGenerator` - 60 edges
7. `lucide-react` - 53 edges
8. `supabaseAdmin` - 51 edges
9. `TestTailwindConfigGenerator` - 41 edges
10. `ShadcnInstaller` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Dropdown/Menu Navigation` --references--> `Tab`  [INFERRED]
  .agents/skills/ui-styling/references/shadcn-accessibility.md → src/frontend/components/ui/Tabs.tsx
- `TestGeneratedConfigIsValidJs` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestTailwindConfigGenerator` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .agents/skills/ui-styling/scripts/tailwind_config_gen.py
- `useApi()` --calls--> `useAuth()`  [EXTRACTED]
  src/hooks/useApi.ts → src/frontend/context/AuthContext.tsx
- `TestShadcnInstaller` --uses--> `ShadcnInstaller`  [INFERRED]
  .agents/skills/ui-styling/scripts/tests/test_shadcn_add.py → .agents/skills/ui-styling/scripts/shadcn_add.py

## Import Cycles
- None detected.

## Communities (201 total, 55 thin omitted)

### Community 0 - "next"
Cohesion: 0.07
Nodes (37): next, RouteContext, RouteContext, RouteContext, dynamic, isValidUUID(), Params, PUT() (+29 more)

### Community 2 - "react"
Cohesion: 0.06
Nodes (55): react, DesignSystemPage(), BarChart(), BarChartItem, LineChart(), LineChartPoint, PieChart(), PieChartSlice (+47 more)

### Community 3 - "handleApiError"
Cohesion: 0.09
Nodes (44): POST(), PUT(), POST(), POST(), POST(), PUT(), GET(), PUT() (+36 more)

### Community 4 - "gray"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 5 - "test_sync_brand_to_tokens.py"
Cohesion: 0.08
Nodes (19): _run(), test_creates_default_output_directory_when_missing(), test_dark_base_color_does_not_collapse_shades_to_black(), test_force_allows_sync_with_existing_css_token_source(), test_ignores_commented_root_custom_properties(), test_ignores_custom_properties_outside_root(), test_ignores_external_css_imports(), test_refuses_css_custom_property_source_without_force() (+11 more)

### Community 6 - "json"
Cohesion: 0.09
Nodes (14): build_cip_prompt(), check_logo_required(), generate_cip_set(), generate_with_nano_banana(), load_env(), load_logo_image(), main(), format_brief() (+6 more)

### Community 7 - "taskService.ts"
Cohesion: 0.08
Nodes (30): GET(), isValidUUID(), resolveOrg(), RouteParams, DELETE(), GET(), isValidUUID(), PUT() (+22 more)

### Community 8 - "app/dashboard/page.tsx"
Cohesion: 0.16
Nodes (8): VerifyEmailContent(), VerifyEmailPage(), ApplicationItem, MentorshipSession, PendingDecision, supabase, useApi(), apiClient

### Community 9 - "Tailwind CSS Utility Reference"
Cohesion: 0.05
Nodes (43): Arbitrary Values, Aspect Ratio, Background Colors, Border Color, Border Radius, Border Style, Border Width, Borders (+35 more)

### Community 10 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.05
Nodes (42): 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Layout & Responsive (HIGH), 5. Typography & Color (MEDIUM), 6. Animation (MEDIUM), 7. Style Selection (MEDIUM), 8. Charts & Data (LOW) (+34 more)

### Community 11 - "Brand Guidelines v1.0"
Cohesion: 0.05
Nodes (37): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Imagery Guidelines, 6. Design Components, Accessibility, AI Image Generation (+29 more)

### Community 12 - "Design"
Cohesion: 0.05
Nodes (36): Banner Design (Built-in), Banner: Design Rules, Banner: Quick Size Reference, Banner: Top Art Styles, Banner: Workflow, CIP Design (Built-in), CIP: Generate Brief, CIP: Generate Mockups (+28 more)

### Community 13 - "logo/generate.py"
Cohesion: 0.13
Nodes (15): _atlas_prediction_data(), _download_atlas_image(), _download_image(), _download_muapi_image(), _generate_with_atlas(), _generate_with_muapi(), _json_request(), load_env() (+7 more)

### Community 14 - "slide_search_core.py"
Cohesion: 0.12
Nodes (14): format_context(), format_result(), main(), calculate_pattern_break(), detect_domain(), get_background_config(), get_color_for_emotion(), get_layout_for_goal() (+6 more)

### Community 15 - "Canvas Design System"
Cohesion: 0.06
Nodes (35): 1. Visual Communication First, 2. Minimal Text Integration, 3. Expert Craftsmanship, 4. Systematic Patterns, Analog Meditation, Approach, Canvas Boundaries, Canvas Design System (+27 more)

### Community 16 - "Page: Pre-Incubator Form (`/programs/preincubator`)"
Cohesion: 0.06
Nodes (34): Admin / Dashboard Page, ARBA Accelerator Platform - Complete UI & Field Reference, File Structure, File Uploads, Incubator Success, Key Technical Notes, Page: Home (`/`), Page: Incubator Form (`/programs/incubator`) (+26 more)

### Community 17 - "mentors/page.tsx"
Cohesion: 0.14
Nodes (15): INITIAL_FALLBACK_MENTORS, MentorExpertise, MentorItem, MentorsHubPage(), DashboardPage(), DashboardLayout(), DashboardLayoutProps, MainLayout() (+7 more)

### Community 18 - "spacing"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 19 - "Form & Input Components"
Cohesion: 0.06
Nodes (32): Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Card, Checkbox (+24 more)

### Community 20 - "Tailwind CSS Responsive Design"
Cohesion: 0.06
Nodes (32): 1. Mobile-First Design, 2. Consistent Breakpoint Usage, 3. Test at Breakpoint Boundaries, 4. Use Container for Content Width, 5. Progressive Enhancement, 6. Avoid Too Many Breakpoints, Best Practices, Breakpoint System (+24 more)

### Community 22 - "requireOrg"
Cohesion: 0.12
Nodes (19): POST(), GET(), PUT(), GET(), POST(), GET(), POST(), GET() (+11 more)

### Community 23 - "Typography Specifications"
Cohesion: 0.06
Nodes (30): Accessibility, Base System, Best Practices, Clean & Modern, Common Font Pairings, Contrast Requirements, CSS Implementation, Editorial (+22 more)

### Community 25 - "html-token-validator.py"
Cohesion: 0.11
Nodes (12): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+4 more)

### Community 26 - "shadcn/ui Accessibility Patterns"
Cohesion: 0.07
Nodes (29): Accordion, Alert, ARIA Labels, Checkbox and Radio, Color Contrast, Command Palette Navigation, Component-Specific Patterns, Dialog/Modal Navigation (+21 more)

### Community 27 - "notificationService.ts"
Cohesion: 0.09
Nodes (32): GET(), isValidUUID(), POST(), resolveOrg(), GET(), handleReminders(), isValidUUID(), POST() (+24 more)

### Community 28 - "Button"
Cohesion: 0.08
Nodes (30): ApplicationItem, ApplicationsPage(), INITIAL_APPLICATIONS, ScoreBadge(), SectorTag(), StatusBadge(), TypeBadge(), CoIncubation (+22 more)

### Community 29 - "Logo Usage Rules"
Cohesion: 0.07
Nodes (28): Absolute Don'ts, Approved Backgrounds, Before Using Logo, Clear Space, Co-branding, Color Rules, Color Usage, Color Variants (+20 more)

### Community 30 - "Component Specifications"
Cohesion: 0.07
Nodes (28): Alert, Anatomy, Anatomy, Anatomy, Anatomy, Anatomy, Badge, Button (+20 more)

### Community 31 - "super-admin/Sidebar.tsx"
Cohesion: 0.10
Nodes (15): AuditEvent, INITIAL_EVENTS, SuperAdminDashboard(), INITIAL_INVOICES, Invoice, initialOrgs, Organization, OrganizationsPage() (+7 more)

### Community 33 - "preincubator/page.tsx"
Cohesion: 0.23
Nodes (26): FormCheckboxGroup(), FormData, FormInput(), FormRadioGroup(), FormSelect(), FormStep, FormTextarea(), getSectionTitle() (+18 more)

### Community 34 - "Asset Approval Checklist"
Cohesion: 0.08
Nodes (25): Accessibility, Archival, Asset Approval Checklist, Automation Support, Color Compliance, Common Issues & Fixes, Content Accessibility, Content Quality (+17 more)

### Community 35 - "Logo AI Prompt Engineering"
Cohesion: 0.08
Nodes (25): Common Pitfalls, Core Prompt Structure, Detailed Brief, Eco/Sustainable, Effective Keywords by Style, Fashion Brand, Healthcare, Industry-Specific Prompts (+17 more)

### Community 36 - "UI Styling Skill"
Cohesion: 0.08
Nodes (25): Accessibility Patterns, Alternative: Tailwind-Only Setup, Best Practices, Common Patterns, Component Layer: shadcn/ui, Component Library Guide, Component + Styling Setup, Core Stack (+17 more)

### Community 37 - "tenant.ts"
Cohesion: 0.14
Nodes (13): POST(), GET(), PUT(), PUT(), GET(), POST(), isValidUUID(), Params (+5 more)

### Community 38 - "Color Palette Management"
Cohesion: 0.08
Nodes (24): Accessibility Requirements, Brand Compliance Validation, Checking Contrast, Color Documentation Format, Color Extraction, Color Palette Examples, Color Palette Management, Color System Structure (+16 more)

### Community 39 - "CIP Deliverable Guide"
Cohesion: 0.08
Nodes (24): Apparel, Business Card, Car/Sedan, CIP Deliverable Guide, Core Identity, Digital Assets, Email Signature, Envelope (+16 more)

### Community 40 - "States and Variants"
Cohesion: 0.08
Nodes (24): Accessibility, Accessibility Requirements, ARIA States, Color Contrast, Color Variants, Disabled States, Error Messages, Error States (+16 more)

### Community 41 - "Workflow"
Cohesion: 0.08
Nodes (23): Art Direction Styles (Reuse from Banner), Color & Contrast, Design Best Practices, HTML Design Rules, HTML Template Structure, Option A: Chrome Headless CLI (Recommended — zero dependencies), Option B: Browser automation provided by the runtime, Option C: Playwright script (+15 more)

### Community 42 - "Design System"
Cohesion: 0.08
Nodes (23): Best Practices, Chart.js Integration, Command, Component Spec Pattern, Contextual Decision Flow, Decision System CSVs, Design System, Integration (+15 more)

### Community 44 - "Tailwind CSS Customization"
Cohesion: 0.09
Nodes (22): @apply Directive, Best Practices, Color Customization, Complete Tailwind Config, Configuration Examples, Content Configuration, Custom Color Palette, Custom Font Sizes (+14 more)

### Community 45 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, version, axios, @base-ui/react, class-variance-authority, eslint, eslint-config-next (+11 more)

### Community 46 - "icon/generate.py"
Cohesion: 0.17
Nodes (8): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main()

### Community 47 - "generate-slide.py"
Cohesion: 0.13
Nodes (10): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+2 more)

### Community 48 - "frontend/context/AuthContext.tsx"
Cohesion: 0.08
Nodes (34): @upstash/redis, POST(), POST(), POST(), POST(), POST(), validatePassword(), ForgotPasswordPage() (+26 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 50 - "Routing by Task Type"
Cohesion: 0.10
Nodes (19): Banner Design Tasks, Brand Identity Tasks, Component Creation, Corporate Identity Program Tasks, Design Routing Guide, Design System Migration, Icon Design Tasks, Implementation Tasks (+11 more)

### Community 51 - "fetch-background.py"
Cohesion: 0.15
Nodes (9): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+1 more)

### Community 52 - "shadcn/ui Theming & Customization"
Cohesion: 0.10
Nodes (19): Base Color Presets, Best Practices, Color Customization, Color Format, Component Customization, CSS Variable System, Customize Styles, Customize Variants (+11 more)

### Community 53 - "incubator/page.tsx"
Cohesion: 0.25
Nodes (18): FormCheckboxGroup(), FormData, FormInput(), FormSelect(), FormStep, FormTextarea(), getSectionTitle(), IncubatorForm() (+10 more)

### Community 54 - "Asset Organization Guide"
Cohesion: 0.11
Nodes (18): Asset Entry (manifest.json), Asset Organization Guide, By Campaign, By Status, By Type, Cleanup Workflow, Components, Directory Structure (+10 more)

### Community 55 - "Primary Color Meanings"
Cohesion: 0.11
Nodes (18): Accessibility Considerations, Analogous, Black, Blue, Color Combinations by Industry, Color Harmony Types, Complementary, Green (+10 more)

### Community 56 - "Core Logo Types"
Cohesion: 0.11
Nodes (18): 1. Wordmark (Logotype), 2. Lettermark (Monogram), 3. Pictorial Mark (Brand Mark), 4. Abstract Mark, 5. Mascot, 6. Emblem, 7. Combination Mark, Aesthetic Styles (+10 more)

### Community 57 - "color"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 58 - "Brand Consistency Checklist"
Cohesion: 0.11
Nodes (17): Audit Frequency, Brand Consistency Checklist, Channel Audit, Collateral, Colors, Common Issues, Email, Imagery (+9 more)

### Community 59 - "CIP Mockup Prompt Engineering"
Cohesion: 0.11
Nodes (17): Apparel (Polo/T-Shirt), Base Prompt Structure, Business Card, CIP Mockup Prompt Engineering, Context Modifiers, Corporate Minimal, Deliverable-Specific Modifiers, Letterhead (+9 more)

### Community 60 - "Color Semantics"
Cohesion: 0.11
Nodes (17): Accent, Applying Semantic Tokens, Background & Foreground, Border & Ring, Color Semantics, Dark Mode Overrides, Destructive, Interactive States (+9 more)

### Community 61 - "lucide-react"
Cohesion: 0.09
Nodes (40): lucide-react, AddCoIncubatorModal(), AddCoIncubatorModalProps, PARTNER_INCUBATORS, AllocateInvestorModal(), AllocateInvestorModalProps, FALLBACK_INVESTORS, AllocateMentorModal() (+32 more)

### Community 62 - "startup-reviews/[id]/route.ts"
Cohesion: 0.22
Nodes (15): DELETE(), GET(), isValidUUID(), Params, PUT(), resolveOrg(), isValidUUID(), Params (+7 more)

### Community 63 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 64 - "Design Principles"
Cohesion: 0.12
Nodes (15): 22 Art Direction Styles, Banner Sizes & Art Direction Styles Reference, Complete Banner Sizes, CTA Rules, Design Principles, Pinterest Research Queries, Print, Print Specs (+7 more)

### Community 65 - "fontSize"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 66 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, axios, @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next (+8 more)

### Community 67 - "extract-colors.cjs"
Cohesion: 0.20
Nodes (11): calculateCompliance(), colorDistance(), displayPalette(), extractHexColors(), findNearestBrandColor(), fs, generateImageMagickCommand(), hexToRgb() (+3 more)

### Community 68 - "CIP Design Reference"
Cohesion: 0.13
Nodes (14): CIP Brief (Start Here), CIP Design Reference, Commands, Deliverable Categories, Design Styles, Detailed References, Generate Mockups, HTML Presentation Features (+6 more)

### Community 69 - "Icon Design Reference"
Cohesion: 0.13
Nodes (14): Available Styles, CLI Options, Commands, Generate Batch Variations, Generate Multiple Sizes, Generate Single Icon, Icon Categories, Icon Design Reference (+6 more)

### Community 70 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 71 - "cip/core.py"
Cohesion: 0.19
Nodes (6): detect_domain(), get_cip_brief(), _load_csv(), search(), search_all(), _search_csv()

### Community 72 - "Copywriting Formulas"
Cohesion: 0.13
Nodes (14): AIDA (Attention-Interest-Desire-Action), Before-After-Bridge, Contrast Patterns, Copywriting Formulas, Core Formulas, Cost of Inaction, FAB (Features-Advantages-Benefits), Formula-to-Slide Mapping (+6 more)

### Community 73 - "documents/[id]/route.ts"
Cohesion: 0.27
Nodes (13): DELETE(), GET(), isValidUUID(), PUT(), resolveOrg(), RouteContext, ALLOWED_EXTENSIONS, calculateExpiryInfo() (+5 more)

### Community 74 - "Banner Design - Multi-Format Creative Banner System"
Cohesion: 0.14
Nodes (13): Art Direction Styles (Top 10), Available Resources, Banner Design - Multi-Format Creative Banner System, Banner Size Quick Reference, Design Rules, Security, Step 1: Gather Requirements (AskUserQuestion), Step 2: Research & Art Direction (+5 more)

### Community 75 - "Messaging Framework"
Cohesion: 0.14
Nodes (13): Core Statements, Elevator Pitches, Framework Structure, Message Architecture, Message by Audience, Message Testing, Messaging Framework, Mission Statement (+5 more)

### Community 76 - "Brand Voice Framework"
Cohesion: 0.14
Nodes (13): Brand Voice Framework, Character Spectrum, Emotion Spectrum, Language Spectrum, Step 1: Define Personality Traits, Step 2: Create Voice Chart, Step 3: Context Adaptation, Tone Spectrum (+5 more)

### Community 77 - "sync-brand-to-tokens.cjs"
Cohesion: 0.20
Nodes (12): adjustBrightness(), CSS_TOKEN_SOURCES, { execFileSync }, extractColorsFromMarkdown(), findExistingTokenSources(), fs, GENERATE_TOKENS_SCRIPT, generateColorScale() (+4 more)

### Community 78 - "validate-asset.cjs"
Cohesion: 0.25
Nodes (13): checkManifest(), formatBytes(), formatOutput(), fs, main(), parseFilename(), path, RULES (+5 more)

### Community 79 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 80 - "Tailwind Integration"
Cohesion: 0.14
Nodes (13): Animation Tokens, Base Layer, Button Example, Component Classes, CSS Variables Setup, Dark Mode Toggle, HSL Format Benefits, shadcn/ui Alignment (+5 more)

### Community 81 - "Layout Patterns"
Cohesion: 0.14
Nodes (13): Card Styles, Component Variants, CSS Structures, Feature Grid (3 columns), Layout Decision Flow, Layout Patterns, Layout Selection by Use Case, Metric Styles (+5 more)

### Community 82 - "evaluation-criteria/[id]/route.ts"
Cohesion: 0.53
Nodes (5): DELETE(), isValidUUID(), Params, PUT(), resolveOrg()

### Community 83 - "update.md"
Cohesion: 0.15
Nodes (12): Color Presets, Examples, Files Modified, Important, Overview, Skills Used, Step 1: Gather Brand Input, Step 2: Update Brand Guidelines (+4 more)

### Community 84 - "Logo Design Reference"
Cohesion: 0.15
Nodes (12): Available Styles, Color Psychology, Commands, Design Brief (Start Here), Detailed References, Generate Logo, Industry Defaults, Logo Design Reference (+4 more)

### Community 85 - "logo/core.py"
Cohesion: 0.21
Nodes (5): detect_domain(), _load_csv(), search(), search_all(), _search_csv()

### Community 86 - "Token Architecture"
Cohesion: 0.15
Nodes (12): Categories, Dark Mode, File Organization, Layer 1: Primitive Tokens, Layer 2: Semantic Tokens, Layer 3: Component Tokens, Layer Overview, Migration from Flat Tokens (+4 more)

### Community 87 - "design-tokens-starter.json"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 88 - "scripts/core.py"
Cohesion: 0.21
Nodes (5): detect_domain(), _load_csv(), search(), _search_csv(), search_stack()

### Community 89 - "render-html.py"
Cohesion: 0.23
Nodes (4): generate_html(), get_deliverable_info(), get_image_base64(), main()

### Community 90 - "Primitive Tokens"
Cohesion: 0.17
Nodes (11): Border Radius, Color Scales, Gray Scale, Motion / Duration, Primary Colors (Blue), Primitive Tokens, Shadows, Spacing Scale (+3 more)

### Community 91 - "embed-tokens.cjs"
Cohesion: 0.17
Nodes (8): args, fs, minimal, MINIMAL_TOKENS, path, projectRoot, tokensPath, wrapStyle

### Community 92 - "validate-tokens.cjs"
Cohesion: 0.24
Nodes (11): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+3 more)

### Community 93 - "card"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 95 - "Core Visual Elements"
Cohesion: 0.18
Nodes (10): Color Palette, Colors, Core Visual Elements, Logo, Logo, Quick Checks, Typography, Typography (+2 more)

### Community 96 - "inject-brand-context.cjs"
Cohesion: 0.31
Nodes (10): extractColorsFromTable(), extractCoreAttributes(), extractHexColors(), extractImageStyle(), extractTypography(), extractVoice(), fs, generatePromptAddition() (+2 more)

### Community 97 - "Brand"
Cohesion: 0.18
Nodes (10): Brand, Brand Sync Workflow, Quick Start, References, Routing, Script Paths, Scripts, Subcommands (+2 more)

### Community 98 - "CIP Design Style Guide"
Cohesion: 0.18
Nodes (10): Bold Dynamic, CIP Design Style Guide, Classic Traditional, Color Psychology, Corporate Minimal, Fresh Modern, Luxury Premium, Modern Tech (+2 more)

### Community 99 - "duration"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 100 - "StartupService"
Cohesion: 0.15
Nodes (10): InvestorAllocation, MentorAllocation, Startup, TeamMember, fallbackStartups, GetStartupsFilter, isValidUUID(), mapRowToStartup() (+2 more)

### Community 101 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 102 - "Component Tokens"
Cohesion: 0.20
Nodes (9): Alert Tokens, Badge Tokens, Button Tokens, Card Tokens, Component Tokens, Dialog/Modal Tokens, Input Tokens, Table Tokens (+1 more)

### Community 103 - "generate-tokens.cjs"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 104 - "button"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 105 - "Slide Strategies"
Cohesion: 0.20
Nodes (9): Common Structures, Duarte Sparkline Pattern, Matching Strategy to Context, Product Demo (6 slides), Sales Pitch (9 slides), Search Commands, Slide Strategies, Strategy Selection (+1 more)

### Community 107 - "feedback/route.ts"
Cohesion: 0.60
Nodes (4): isValidUUID(), Params, POST(), resolveOrg()

### Community 110 - "BM25"
Cohesion: 0.18
Nodes (3): BM25, _load_csv(), _search_csv()

### Community 114 - "availability/route.ts"
Cohesion: 0.42
Nodes (8): GET(), getMentorAndSessionCount(), handleSetAvailability(), isValidUUID(), Params, POST(), PUT(), resolveOrg()

### Community 115 - "input"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 116 - "radius"
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

### Community 117 - "ARBA Accelerator"
Cohesion: 0.25
Nodes (7): ARBA Accelerator, Contact, Features, Getting Started, Project Structure, Tech Stack, What is this?

### Community 118 - "incubators/page.tsx"
Cohesion: 0.18
Nodes (11): CATEGORIES, DatabaseOrganization, FORMATS, Incubator, IncubatorsPage(), loadIncubatorsFromDatabase(), INITIAL_INCUBATORS, mapOrganizationToIncubator() (+3 more)

### Community 119 - "mentorship-sessions/[id]/route.ts"
Cohesion: 0.43
Nodes (7): DELETE(), GET(), isValidUUID(), Params, PUT(), resolveOrg(), timeToMinutes()

### Community 120 - "Event"
Cohesion: 0.43
Nodes (3): Event, EventRegistration, EventService

### Community 121 - "Slides Reference"
Cohesion: 0.29
Nodes (6): Key Features, Knowledge Base, Slides Reference, Usage, When to Use, Workflow

### Community 122 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 124 - "HTML Slide Template"
Cohesion: 0.29
Nodes (6): Animation Classes, Background Images, Base Structure, Chart.js Integration, CSS Variables Reference, HTML Slide Template

### Community 125 - "Slides"
Cohesion: 0.29
Nodes (6): References (Knowledge Base), Routing, Script Paths, Slides, Subcommands, When to Use

### Community 126 - "design_system.py"
Cohesion: 0.16
Nodes (4): format_ascii_box(), format_markdown(), generate_design_system(), format_output()

### Community 128 - "@supabase/supabase-js"
Cohesion: 0.15
Nodes (7): @supabase/supabase-js, isValidToken(), config, middleware(), runTests(), supabaseAdmin, supabaseAdmin

### Community 129 - "sm"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 130 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 131 - "evaluations/route.ts"
Cohesion: 0.73
Nodes (5): GET(), isValidUUID(), POST(), resolveEvaluatorId(), resolveOrg()

### Community 132 - "action-points/route.ts"
Cohesion: 0.53
Nodes (5): GET(), isValidUUID(), Params, POST(), resolveOrg()

### Community 133 - "notifications/[id]/route.ts"
Cohesion: 0.67
Nodes (5): DELETE(), GET(), isValidUUID(), Params, resolveOrg()

### Community 134 - "csv/route.ts"
Cohesion: 0.60
Nodes (5): escapeCsvValue(), GET(), isValidUUID(), jsonToCsv(), resolveOrg()

### Community 135 - "lib/apiClient.ts"
Cohesion: 0.60
Nodes (5): apiClient(), clearTokens(), ensureFreshToken(), getAccessToken(), setAccessToken()

### Community 136 - "Brand Guidelines Template"
Cohesion: 0.40
Nodes (4): Brand Guidelines Template, Document Structure, Extractable Fields, Usage

### Community 137 - "$type"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 138 - "radius"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 139 - "lg"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 140 - "evaluations/[id]/route.ts"
Cohesion: 0.60
Nodes (5): isValidUUID(), Params, PUT(), resolveEvaluatorId(), resolveOrg()

### Community 141 - "os"
Cohesion: 0.25
Nodes (5): enhance_prompt(), generate_batch(), generate_logo(), _generate_with_gemini(), main()

### Community 142 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 143 - "score/route.ts"
Cohesion: 0.60
Nodes (4): GET(), isValidUUID(), Params, resolveOrg()

### Community 144 - "padding-y"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 145 - "xl"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 146 - "complete/route.ts"
Cohesion: 0.60
Nodes (4): isValidUUID(), Params, PUT(), resolveOrg()

### Community 147 - "none"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 148 - "Database Configuration"
Cohesion: 0.50
Nodes (3): Connection Details, Database Configuration, Environment Variables

### Community 151 - "destructive"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 152 - "destructive-foreground"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 153 - "muted"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 154 - "primary-foreground"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 155 - "ring"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 156 - "secondary-foreground"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

### Community 194 - "app/page.tsx"
Cohesion: 0.60
Nodes (4): Home(), metadata, Counter(), ScrollRevealInit()

### Community 197 - "16"
Cohesion: 0.67
Nodes (3): $type, $value, 16

### Community 198 - "1"
Cohesion: 0.67
Nodes (3): $type, $value, 1

### Community 199 - "3"
Cohesion: 0.67
Nodes (3): $type, $value, 3

### Community 200 - "8"
Cohesion: 0.67
Nodes (3): $type, $value, 8

## Knowledge Gaps
- **1176 isolated node(s):** `fs`, `path`, `fs`, `path`, `fs` (+1171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1581 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `@supabase/supabase-js`, `react`, `handleApiError`, `evaluations/route.ts`, `action-points/route.ts`, `notifications/[id]/route.ts`, `csv/route.ts`, `app/dashboard/page.tsx`, `taskService.ts`, `evaluations/[id]/route.ts`, `score/route.ts`, `mentors/page.tsx`, `complete/route.ts`, `requireOrg`, `notificationService.ts`, `Button`, `validation.ts`, `super-admin/Sidebar.tsx`, `preincubator/page.tsx`, `tenant.ts`, `package.json`, `frontend/context/AuthContext.tsx`, `incubator/page.tsx`, `lucide-react`, `startup-reviews/[id]/route.ts`, `app/page.tsx`, `documents/[id]/route.ts`, `evaluation-criteria/[id]/route.ts`, `feedback/route.ts`, `SimpleLayout.tsx`, `availability/route.ts`, `incubators/page.tsx`, `mentorship-sessions/[id]/route.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `fs` to the rest of the system?**
  _1176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06651017214397496 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `preincubator/page.tsx`, `app/page.tsx`, `app/dashboard/page.tsx`, `package.json`, `frontend/context/AuthContext.tsx`, `mentors/page.tsx`, `SimpleLayout.tsx`, `incubator/page.tsx`, `incubators/page.tsx`, `Button`, `lucide-react`, `super-admin/Sidebar.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `ShadcnInstaller` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._
- **Why does `TailwindConfigGenerator` connect `TailwindConfigGenerator` to `json`, `TestTailwindConfigGenerator`, `.test_add_color_palette`, `.test_add_fonts`, `.test_add_breakpoints`, `.test_add_plugins_no_duplicates`, `.test_recommend_plugins_nextjs`, `.test_generate_typescript_config`, `.test_generate_javascript_config`, `.test_generate_config_with_plugins`, `.test_validate_config_valid`, `.test_validate_config_no_content`, `.test_write_config`, `.test_write_config_creates_content`, `.test_write_config_force_overwrites_existing_file`, `.test_default_output_path_typescript`, `.test_full_configuration_typescript`, `.test_custom_output_path`, `.test_base_config_structure`, `.test_default_content_paths_nextjs`, `.test_default_content_paths_vue`, `.test_add_colors`, `.generate_config_string`, `._base_config`, `TestGeneratedConfigIsValidJs`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.0563165905631659 - nodes in this community are weakly interconnected._