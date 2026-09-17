# GovTech Hackathon – DSAC Project: Design Thinking & 3-Day Plan

2026-09-17 · @Someone

## 1. The Challenge, Recapped

DSAC funds **26 Public Entities + 6 NPOs**. Each must report on agreed targets and fund accountability. Right now everything moves by **email**, so entities miss deadlines and DSAC's own team can't analyse anything across the portfolio. DSAC wants a single solution that gives both the entities (submitting) and DSAC (overseeing) a dashboard on shared KPIs, built from five requirement blocks: **Analytics Module, Early Warning, Document Repository, Workspaces (MS-integrated), Security & Privacy.**

### Why the Sukuma Sakhe story matters here

Your contact's Sukuma Sakhe example is a different programme (provincial social-issues hotline) but it's the same disease DSAC has:

- Reports come in through a channel (call centre / email) but get captured manually — no structured data at the point of intake.
- The reporter (citizen, or here, a Public Entity) doesn't reliably tag where they belong (ward, or here, entity/department) — so nothing rolls up.
- No structured records means no analytics, which means leadership can't see the state of the province (or department) or reallocate budget to where it's actually needed.

That's the wedge to design against: manual intake plus missing structured metadata equals leadership flying blind on budget and performance. It matches DSAC's own framing of wanting management information at the click of a button, so it's good validation of the problem rather than a separate one.

## 2. Empathize

Four personas across the reporting chain. Keep the beginner's mindset from the Red Bull Basement deck: forget what a "government dashboard" is supposed to look like, and actually sit with what each of these people is doing on a Tuesday morning.

### Persona A — Thandi, PE Reporting Officer

Works at one of the 26 public entities. Responsible for compiling the quarterly report and emailing it to DSAC before the deadline.

- **Thinks:** "I never know if DSAC actually got my email, or if it's sitting unread."
- **Feels:** Anxious near deadlines; no visibility into whether her submission is complete or compliant until someone flags it (often after the fact).
- **Does:** Chases down source documents from finance and programme teams, assembles a report in Word/Excel, emails it, then waits.
- **Needs:** A single place to upload, a clear checklist of what's outstanding, and confirmation her submission was received and is "in progress" not lost.

### Persona B — Sipho, DSAC M&E / Compliance Officer

Sits at DSAC head office. Owns the relationship with all 32 reporting entities.

- **Thinks:** "I have 32 inboxes to watch and no way to see who's behind until I go digging."
- **Feels:** Overwhelmed by manual cross-checking; reactive rather than proactive — he finds out about a missed deadline only once it's already missed.
- **Does:** Manually opens each email, checks it against a spreadsheet of targets, chases non-responders by phone.
- **Needs:** A live view of every entity's status (in progress / not started / deadline missed), and an early nudge before deadlines lapse — not after.

### Persona C — the DSAC Executive / DG

Needs to answer to the Minister and Treasury on how the department's funded entities are performing.

- **Thinks:** "If a journalist or the Minister asks me right now how entity X is doing, can I answer in under a minute?"
- **Feels:** Exposed — public sentiment about service delivery is shaped by things the department can't see coming.
- **Does:** Requests ad-hoc reports from Sipho's team, which take days to compile from scattered emails.
- **Needs:** A portfolio-level dashboard — trends, year-on-year comparisons, audit findings, demographics, job creation — available on demand, not on request.

### Persona D — the citizen (Sukuma Sakhe lens)

Not a direct user of this system, but the reason it exists: the person whose sport programme, arts grant or cultural initiative depends on these entities delivering. The Sukuma Sakhe insight applies directly — when reporting is manual and unstructured, the citizen's experience (a programme that under-delivers, a grant that stalls) is invisible until it's already a complaint or a headline.

### Shared pain, underneath all four

Every persona is fighting the same thing: **information exists, but only in someone's inbox.** Nobody — not the entity, not DSAC, not the citizen — can see the true state of a target until a human manually looks.

## 3. Define

Using the deck's formula — **\[User\] (descriptive) needs \[need (verb)\] because \[insight (compelling)\]**:

> **Thandi**, a reporting officer juggling documents from three different internal teams, needs a single place to submit and track her report, because right now she has no way to know whether DSAC even received it until someone chases her.

> **Sipho**, watching 32 entities with nothing but a spreadsheet and his memory, needs to see risk before a deadline is missed, because by the time he finds out from an unopened email it's already too late to intervene.

> **The DSAC Executive**, who has to answer for the whole portfolio's performance at any moment, needs an always-on view of trends and targets, because compiling that picture today takes days of manual chasing — exactly the gap that erodes public sentiment when it shows up late.

### How Might We

Seeds for the ideation session:

- HMW turn a missed report into something DSAC sees coming, instead of something it discovers after the fact?
- HMW make submitting a report feel like ticking a checklist instead of assembling one from scratch?
- HMW give the DSAC exec a portfolio view without anyone having to manually compile it?
- HMW use the same structured intake to power both compliance (did they submit) and insight (are they on track)?
- HMW make "status" a live thing instead of a document someone re-reads every time they want an answer?

## 4. Ideate

Ideas mapped against DSAC's five requirement blocks, so nothing pulls the team off-brief. Quantity over polish at this stage — the MVP cut happens in Prototype.

### a) Analytics Module

- Entity-level dashboard: targets in progress / not started / deadline missed, colour-coded.
- Year-on-year and audit-finding trend charts per entity.&#32;
- Staff demographics and job-creation stats rolled up automatically from structured submissions (not re-typed).
- "Holding company" rollup view: DSAC sees all 32 entities at once; each entity only sees its own data.

### b) Early Warning Functionality

- Risk score per entity, driven by submission history (late before? incomplete before?).
- Countdown badges: 30 days / 15 days / hourly as a due date approaches.
- Automated nudge to the entity *and* an escalation to Sipho if nothing happens by T-minus-X.

### c) Document Repository

- One upload point per entity for strategic plans, APPs, operational plans, annual/quarterly reports, financials.
- Checklist view so Thandi can see at a glance what's outstanding for the current cycle.
- Every upload auto-tags itself against the KPI/target it satisfies — this is the structured-metadata fix from the Sukuma Sakhe insight.

### d) Workspaces (MS-integrated)

- Version control triggered on every save/upload.
- Inline comments, visible in real time — DSAC can query a report without leaving the platform.
- Task assignment up/down the chain (DSAC → entity, or entity internally).
- Approval receipts on upload, so Thandi finally gets the confirmation she's missing today.
- Mobile-usable, since not every reporting officer is at a desk when a deadline lands.

### e) Security and Privacy

- Role-based access: an entity sees only its own data; DSAC sees the portfolio.
- Audit trail on every document and status change (who, when, what).
- Aligned to South African data protection principles — worth a slide even if not fully implemented, since it's an explicit judging criterion.

### Idea worth protecting

The single idea that ties everything together: **capture structured data once, at the point of submission**, and let the dashboard, the early warning, and the repository all read from that one source. That's what turns "email attachments" into "management information at the click of a button" — and it's the difference between this and a glorified file-sharing folder.

## 5. Prototype Scope

Three days is enough to build one thing well, not five things badly. Cut ruthlessly to what proves the core idea — structured capture feeding a live dashboard — and fake the rest convincingly.

### Build for real (this is the demo's spine)

- **Structured submission form** (not a file upload) for one report type — e.g. quarterly APP status — that captures targets against a fixed KPI schema.
- **Analytics dashboard**: entity status board (in progress / not started / missed), one trend chart, one demographics/job-creation view — built from the structured data just captured.
- **Early warning**: countdown badge + one automated notification (even a scheduled email/console alert is enough to demo the concept).
- **Two role views**: an Entity view (Thandi submitting) and a DSAC view (Sipho/exec seeing the portfolio) — this single split does most of the work to convince judges you understand the "subsidiary / holding company" framing.

### Fake convincingly, don't build

- Full document repository for every document type — show one working upload with the auto-tagging idea explained, not five file types wired up.
- Full Microsoft Graph/SharePoint integration — mock the version-control and comment UI, narrate the integration path rather than wiring live Graph API calls (unless a team member already knows this cold).
- Mobile app — a responsive web view is enough; don't build native.
- Full RBAC/security implementation — implement basic role separation for the demo, describe the fuller security/privacy approach on a slide (this is 10% of the judging criteria, not the differentiator).

### Suggested stack

Given what's worked on past Kizuri client builds: **Next.js/React** frontend, **.NET (C#)** backend for the API and to make the "Microsoft-native" story credible, a lightweight relational store (MySQL or SQL Server) for the structured KPI data. If anyone on the team has Power BI or Microsoft Graph experience, even a thin real Graph API call (e.g. pulling a OneDrive file into the repository) is worth more to judges than a mock, because it's a criterion ("Innovation and Use of Emerging Technologies," "Technical Feasibility") — but only if it doesn't put the core demo at risk.

## 6. Test & Demo Plan

"Prototype as if you know you're right, but test as if you know you're wrong." Run at least one real walkthrough with someone outside the build team (even a Kizuri colleague who hasn't seen the app) before the judges do — that's the test stage.

### Test checklist before the pitch

- Can a first-time user submit a report end-to-end without being told how?
- Does the dashboard visibly change after a submission — is the loop obvious to someone watching?
- Does the early-warning badge/notification actually fire during the live demo, or does it need a rehearsed shortcut?
- Time the demo — GovTech gives 5% for presentation, but a demo that overruns eats into Q&A, which is where technical credibility is won or lost.

### Map the demo narrative directly to the adjudication criteria

| Criterion | Weight | What to show |
| --- | --- | --- |
| Relevance to Challenge | 20% | Open on the entity submitting a structured report — this is the manual-email pain point, solved. |
| Innovation & Emerging Tech | 15% | The auto-tagging/structured-capture idea, and the early-warning risk logic. |
| Technical Feasibility | 20% | Switch to the DSAC view live — the dashboard updates from real data just entered, not a static mockup. |
| UX, Accessibility, Inclusivity | 10% | Show the responsive/mobile view; call out low-bandwidth and digital-literacy considerations even where only partially built. |
| Data, Intelligence & Insight | 10% | The trend chart and risk score — explain what data drives them. |
| Security & Governance | 10% | One slide: role-based access, audit trail, POPIA alignment. |
| Scalability & Digital Sovereignty | 10% | One slide: open architecture, how this generalises beyond DSAC to any department with subsidiary reporting (the Sukuma Sakhe parallel is a strong talking point here). |
| Presentation | 5% | Rehearsed, timed, one person narrates while another drives the demo. |

Going in with this table pinned up in the war room keeps the last hours from drifting into polishing things judges won't score.

## 7. 3-Day Project Plan

Roles are generic below (swap in actual names once the team's confirmed): **Lead/Design**, **Frontend**, **Backend**, **Data/Dashboard**, **Pitch**. One person can hold more than one role on a small team.

### Day 1 — Empathize → Define → Ideate → Design Lock

- **Morning:** Walk the whole team through this doc's Empathize and Define sections. Everyone should be able to say Thandi's, Sipho's and the exec's needs from memory by lunch.
- **Midday:** Ideate session using the How Might We list — timebox to 60–90 minutes, then converge on the Prototype Scope above. Lock it; no scope changes after today.
- **Afternoon:** Split work: Lead/Design wireframes the two role-views (Entity, DSAC); Backend designs the KPI data schema; Frontend scaffolds the app shell; Data/Dashboard plans the chart/analytics approach; Pitch starts drafting the narrative from the Test & Demo table.
- **End of day:** Working skeleton — empty screens, wired routes, agreed schema. Nobody starts Day 2 without this.

### Day 2 — Build

- **Morning:** Backend builds the structured submission API + schema; Frontend builds the submission form against it; Data/Dashboard starts on the dashboard shell.
- **Midday:** First end-to-end slice working — a submission that shows up on the dashboard. This is the single most important milestone of the hackathon; protect the time for it.
- **Afternoon:** Layer on early-warning badges/notifications, the DSAC portfolio view, and the one "fake convincingly" repository upload. Pitch keeps refining the story and slides in parallel, not after.
- **End of day:** Feature-complete against the locked scope. Freeze new features.

### Day 3 — Test → Polish → Present

- **Morning:** Run the test checklist from Test & Demo Plan with a fresh pair of eyes. Fix only what breaks the demo path — resist the urge to add anything new.
- **Midday:** Full dry run, timed, against the adjudication-criteria table. Tighten the narrative so every criterion gets an explicit beat.
- **Early afternoon:** Second dry run with Q&A practice — assign who answers technical vs. impact questions.
- **Before submission/demo slot:** Final build check (does it run on the demo machine/network?), slides finalised, one calm run-through as a team.

## 8. Role Specifications — Who Does What, Who Sees What

Four actors, drawn straight from Empathize: **Thandi** (Entity Reporting Officer), **Sipho** (DSAC M&E/Compliance Officer), the **DSAC Executive**, and the **System** itself — the automated layer nobody has to babysit.

### a) Analytics Module

| Role | Sees | Does |
| --- | --- | --- |
| Thandi (Entity) | Her own entity's dashboard only — status, trend chart, demographics for that entity | Nothing manual — this view is read-only for her |
| Sipho (DSAC M&E) | The full 32-entity rollup; can drill into any single entity | Monitors the rollup, follows up where status is red |
| DSAC Executive | Same portfolio rollup, summarised to trends and year-on-year comparisons | Uses it in Minister/Treasury conversations — no data entry |
| System | — | Computes every rollup, chart and demographic stat automatically from structured submissions; nobody re-types anything |

### b) Early Warning

| Role | Sees | Does |
| --- | --- | --- |
| Thandi | Her own entity's risk score and countdown badge | Receives the nudge; submitting is what clears it |
| Sipho | Risk scores across all 32 entities | Receives the T-minus-X escalation and follows up with entities flagged high-risk |
| DSAC Executive | Aggregated risk only (e.g. "3 entities at risk this quarter") | Not notified per-entity — that's Sipho's layer, not the exec's |
| System | — | Computes the risk score, fires countdown badges, sends the nudge and the escalation automatically |

### c) Document Repository

| Role | Sees | Does |
| --- | --- | --- |
| Thandi | Her own entity's checklist and upload history | Uploads documents against her entity's checklist |
| Sipho | Any entity's uploaded documents and checklist status | Views/downloads, flags gaps back to the entity — doesn't upload on their behalf, so accountability stays with the entity |
| DSAC Executive | Summary of what's outstanding across the portfolio | Nothing operational |
| System | — | Auto-tags every upload against the KPI/target it satisfies |

### d) Workspaces (MS-integrated)

| Role | Sees | Does |
| --- | --- | --- |
| Thandi | Comments and version history on her own entity's documents; gets an approval receipt on upload | Edits, comments, responds to tasks assigned to her |
| Sipho | Comments and version history across all entities | Comments on any submission, assigns tasks up/down the chain, approves on receipt |
| DSAC Executive | Read access to comments/version history where relevant | Can issue a top-down task, e.g. "flag entity X for review" |
| System | — | Triggers version control on save/upload; issues the approval receipt |

### e) Security and Privacy

| Role | Sees | Does |
| --- | --- | --- |
| Thandi | Only her own entity's data — no visibility into other entities | Operates entirely inside her own entity's role |
| Sipho | Full portfolio, read/write on reports | Portfolio-level oversight |
| DSAC Executive | Full portfolio, read-only, plus approval actions | Approves and escalates at the executive level |
| System | — | Logs every action — who, when, what — to the audit trail regardless of role; this is what makes the security slide honest rather than aspirational |

### Why this split matters for the demo

The role separation isn't just tidy governance — it's the clearest way to prove you understood the brief's "subsidiary / holding company" framing (Relevance, 20%) and it directly answers the Security & Governance criterion (10%) without needing to build full RBAC. Show Thandi's scoped view next to Sipho's portfolio view during the demo and the access-control story tells itself.

## 9. Frontend File Architecture

Next.js App Router, split by role at the routing level so Thandi's and Sipho's/the exec's views never leak into each other by accident — the same separation that Section 8 describes, enforced in the folder structure itself.

```
src/
├── app/
│   ├── (entity)/                  # Thandi's world — scoped to her own entity
│   │   ├── layout.tsx             # entity nav shell, role guard
│   │   ├── dashboard/
│   │   │   └── page.tsx           # her entity's status, risk badge, trend
│   │   ├── submit/
│   │   │   └── page.tsx           # structured KPI submission form
│   │   └── documents/
│   │       └── page.tsx           # checklist + upload panel
│   │
│   ├── (dsac)/                    # Sipho / DSAC Exec — portfolio-wide
│   │   ├── layout.tsx             # DSAC nav shell, role guard
│   │   ├── portfolio/
│   │   │   └── page.tsx           # "holding company" rollup, all entities
│   │   ├── entities/
│   │   │   └── [entityId]/
│   │   │       └── page.tsx       # drill-down into one entity
│   │   └── alerts/
│   │       └── page.tsx           # risk queue, T-minus-X escalations
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx                 # root layout, theme, providers
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   │   ├── StatusBoard.tsx        # in progress / not started / missed
│   │   ├── TrendChart.tsx         # year-on-year, audit findings
│   │   ├── DemographicsPanel.tsx  # staff + job-creation stats
│   │   └── RiskBadge.tsx          # countdown: 30d / 15d / hourly
│   ├── submission/
│   │   ├── SubmissionForm.tsx
│   │   ├── KPIFieldGroup.tsx      # fixed schema fields, not free text
│   │   └── ChecklistPanel.tsx     # what's outstanding this cycle
│   ├── documents/
│   │   ├── UploadPanel.tsx        # auto-tags against KPI/target on upload
│   │   ├── DocumentList.tsx
│   │   └── CommentThread.tsx      # real-time comments, version history
│   ├── layout/
│   │   ├── EntitySidebar.tsx
│   │   ├── DSACSidebar.tsx
│   │   └── TopNav.tsx
│   └── ui/                        # shared primitives: buttons, badges, tables
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── submissions.ts
│   │   ├── entities.ts
│   │   └── alerts.ts
│   ├── auth/
│   │   └── roles.ts               # Thandi / Sipho / Exec permission map
│   └── types/
│       ├── entity.ts
│       ├── submission.ts
│       └── kpi.ts
│
├── hooks/
│   ├── useSubmissionStatus.ts
│   ├── useRiskScore.ts
│   └── usePortfolioData.ts
│
└── styles/
    └── theme.ts
```

### Why it's split this way

- **Route groups `(entity)` and `(dsac)`** map directly to the role table in Section 8 — each has its own layout and guard, so an entity officer physically cannot render a DSAC-only route, which is a stronger demo story than a role check buried in a single shared page.
- **`lib/auth/roles.ts`** is the one file that encodes the whole permission table from Section 8 — worth pointing to directly if a judge asks how access control works.
- **`components/` is grouped by feature, not by type** (dashboard/, submission/, documents/), so it tracks the five requirement blocks from Ideate one-to-one — easy to explain, easy to divide work on Day 1.
