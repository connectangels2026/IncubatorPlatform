# ARBA Accelerator

**Incubator & Pre-Incubator Platform**

> 🚀 Live site: [https://arbaincubators.netlify.app/](https://arbaincubators.netlify.app/)

---

## What is this?

ARBA Accelerator is a startup incubation platform that helps founders take their early-stage ideas and turn them into growing businesses. The platform offers **two structured programs** — a **Pre-Incubator** and an **Incubator** — each designed to support startups at a different stage of their journey.

The purpose of this web app is simple: **guide founders from "I have an idea" to "I have a validated, fundable business."** Whether someone is just starting out or ready to scale, the platform provides clear next steps, detailed program information, and a full application flow to get them enrolled.

---

## Features

- **Two clear programs** — Pre-Incubator (for early-stage ideas) and Incubator (for validated startups ready to scale), with transparent duration, cost, and benefits.
- **Program comparison** — An at-a-glance table that helps founders understand the difference between the two paths.
- **Detailed program pages** — Each program opens a dedicated detail view so users know exactly what to expect before applying.
- **Full application questionnaires** — Multi-section application forms (14 sections for the Pre-Incubator) that assess founder readiness, business stage, market, team, and more.
- **Clean, modern UI** — A professional, light theme with a polished hero section, smooth scrolling, and a responsive layout that works on desktop and mobile.

---

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework for server-rendered, fast, SEO-friendly pages
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [TypeScript](https://www.typescriptlang.org/) — Type-safe development

---

## Getting Started

Clone the repository and install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To build for production:

```bash
npm run build
npm run start
```

---

## Project Structure

```
incubator-platform/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home page (hero, features, programs, CTA)
│   │   ├── globals.css         # Global styles / theme
│   │   ├── layout.tsx          # Root layout
│   │   └── programs/
│   │       ├── page.tsx        # Programs overview & comparison
│   │       ├── preincubator/   # Pre-Incubator application form
│   │       └── incubator/      # Incubator application form
│   └── components/
│       └── ui/
│           └── button.tsx      # Reusable Button component
└── package.json
```

---

## Contact

Have a question or want to get your startup started? Reach out to us at **hello@incubator.com**.
