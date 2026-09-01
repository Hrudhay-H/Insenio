# Genie Campus Lab Match — Design Doc

Companion to the PRD/TRD — covers information architecture, screen-by-screen structure, and visual direction.

---

## 1. Design principles

- **Marketplace, not chatbot.** Chat is one tool inside the app (onboarding + Apply Assist), not the whole interface. The main experience is browsable: cards, filters, dashboards.
- **Transparent, not opaque.** Every match/gap shown with a reason, not a bare score or label. Applies to UI copy as much as backend logic.
- **Student-facing tone, not developer-console tone.** Warm, readable, card-based — not dense technical/API-console styling (see §2).
- **Two roles, one shell.** Student and Lab dashboards share the same sidebar + content layout pattern; only the nav items and content differ.

---

## 2. Visual register

Reference layout pattern borrowed: **persistent left sidebar + main content area + top tabs for sub-views** — a sound, familiar structure for moving between chat, marketplace, profile, and applications without losing context.

**What to leave behind from a dev-console reference:** monospace code blocks, "Generate API Key" style CTAs, dense technical copy. That register fits developers integrating an API — it reads cold and mismatched for undergrads browsing labs.

**What to use instead:** rounded cards, plain-language labels, the same visual language as the marketplace card mockup already built (readiness labels, gap reasons, save/apply buttons) — approachable over technical.

---

## 3. Information architecture

```
Landing page (pre-login)
   └── Login/Signup → role: Student | Lab/PI
                              │
                ┌─────────────┴─────────────┐
         Student Dashboard            Lab Dashboard
         ├── Chat with Genie          ├── My Listings
         ├── Marketplace              ├── Applicants
         ├── My Profile               └── Mini Dashboard (view stats)
         ├── Applications
         └── Saved Labs
```

Single login flow with a role field — do not build two separate auth systems. Role determines which dashboard renders post-login.

---

## 4. Landing page (pre-login)

One screen, not a marketing site. Contents:
- Product name + one-line value prop (what it does, in plain language — not "AI-powered matching platform," more like "find a research lab that actually fits you, without cold emails").
- 2–3 line problem statement (advisor referrals are slow/biased, cold emails go unanswered).
- Two CTAs: **"I'm a Student"** / **"I'm a Lab/PI"** → routes into login with role pre-selected.

---

## 5. Auth

- Single login/signup form.
- Role selector (Student / Lab-PI) — either chosen on the landing page CTA or as a field in the form.
- Post-login redirect based on role; no shared dashboard view.

---

## 6. Student dashboard

**Sidebar:**
| Item | Purpose |
|---|---|
| Chat with Genie | Profile intake/edit conversation — same panel used for onboarding and later edits |
| Marketplace | Browsable/filterable lab card grid (readiness label, gap reasons, save/apply) |
| My Profile | Structured, editable view of what Genie extracted — direct edits without re-chatting for small changes |
| Applications | Tracker: Applied → Pending → Interview → Decision |
| Saved Labs | Bookmarked cards for later |

**Home/default view on login:** Marketplace, with a persistent profile summary bar at top ("Python, DSA · interested in AI · 8 hrs/week" + "Update in chat" link) — matches the marketplace mockup already built.

**Apply flow (within a lab card/detail view):** Apply button → Genie drafts outreach message + answers to any lab-specific questions from the student's real profile data → student reviews/edits → sends. Never auto-sends (see PRD §1.6, §2.5).

---

## 7. Lab/PI dashboard

**Sidebar:**
| Item | Purpose |
|---|---|
| My Listings | Post/edit lab openings — form-based for the hackathon build (see §8); Genie-conversational is roadmap |
| Applicants | Students who've applied, with their matched skills/interests surfaced per applicant |
| Mini Dashboard | View stats — "12 students viewed your lab, 4 are strong matches" — the incentive mechanism for keeping data current (PRD §1.6) |

**Home/default view on login:** My Listings, with a prompt to post an opening if none exist yet.

---

## 8. Hackathon build scope

Two full role-based dashboards is more surface area than a 12-hour build easily supports. Split accordingly:

**Build fully (this is the demo's spine):**
- Landing page
- Auth (can be minimal/mocked if time-constrained — role selection is what matters for the demo, not production-grade auth)
- Student dashboard: Chat with Genie, Marketplace, My Profile, Apply Assist flow

**Build minimally (enough to prove the two-sided marketplace exists):**
- Lab dashboard: a simple listing form (not a Genie conversation) + a basic applicants table
- Mini Dashboard view stats can be a static/mocked example if time runs out — still demonstrates the concept

**Explicitly roadmap, say so in the pitch:**
- PI-side Genie conversation for updating listings
- Application status tracker automation, saved-lab change alerts

---

## 9. Reused components across both dashboards

- **Card component**: used for both lab listings (student marketplace) and applicant entries (lab dashboard) — same visual pattern, different data, less UI work to build twice.
- **Gap/match breakdown**: shown to students per lab, and inverted to show labs per applicant ("this applicant is missing X") — same underlying matching logic (PRD §2.4/TRD), two presentations.
- **Chat panel**: same Genie-Space-backed component powers student intake, profile edits, and Apply Assist — one component, three entry points, not three separate builds.
