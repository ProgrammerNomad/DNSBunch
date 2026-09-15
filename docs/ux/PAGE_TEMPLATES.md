# Page templates (T1–T6)

One wireframe per **page type**. Individual tools reuse **T2** with different copy and result fields - not separate mockups per tool.

## T1 - DNS health home

**Route:** `/` (also domain paths → same UI)

```text
[AppShell]
  Hero (h1, subtitle - shorter than today optional)
  DomainSearchForm → shadcn Input + Button
  Tabs: Normal | Advanced
  ResultsPanel → Table / accordion (migrate from DNSResults*)
  Empty: prompt to enter domain
[AppShell]
```

**shadcn:** `Input`, `Button`, `Tabs`, `Table`, `Alert`, `Skeleton` (loading).

**Feature:** [dns-health-single.md](../features/shipped/dns-health-single.md).

---

## T2 - Generic tool page

**Route:** `/tools/{slug}`

```text
[ToolPageLayout]
  Breadcrumb
  h1 + description (SEO)
  Single primary input (domain, host, URL per tool)
  Run button
  ResultsPanel (tool-specific rows)
  Related tools (Card links)
```

**shadcn:** `Card`, `Input`, `Button`, `Table`, `Badge`, `Alert`.

**Used by:** Phase 1 email/website/domain tools, most Phase 3 config UIs on same layout.

---

## T3 - Bulk DNS health

**Route:** `/tools/bulk-dns-health`

```text
[ToolPageLayout]
  Textarea or paste list (domains, one per line)
  Run bulk (progress bar)
  Summary Table: domain | overall | ns | soa | mx | www | issues
  Row action: View full → T1 drill-down (modal Sheet or navigate /?domain=)
  Bulk 2: CSV upload + download button
```

**shadcn:** `Textarea`, `Progress`, `Table`, `Button`, `Sheet` (optional drill-down).

**Feature:** [bulk-checker.md](../features/dns-health/bulk-checker.md). Bulk 4 job UI extends T3 (Phase 4).

---

## T4 - Mail tester

**Route:** `/tools/mail-tester`

```text
[ToolPageLayout]
  Generated address + Copy button
  Countdown / session TTL
  Instructions (send email from your MTA)
  Poll status → score gauge + checklist table
```

**shadcn:** `Card`, `Button`, `Progress`, `Table`, `Alert`.

**Feature:** [mail-tester-inbound.md](../features/email/mail-tester-inbound.md).

---

## T5 - Account dashboard

**Route:** `/dashboard`

```text
[AppShell - authenticated]
  Sidebar or tabs: History | Watches | Settings
  History: Table of past runs (domain, tool, date) - Phase 2
  Watches: Phase 3 monitoring list
  Settings: email, delete account
```

**shadcn:** `Tabs`, `Table`, `Dialog`, `DropdownMenu`.

**Feature:** [auth-optional-accounts.md](../features/platform/auth-optional-accounts.md).

---

## T6 - Tools hub

**Route:** `/tools`

```text
[AppShell]
  h1: All tools
  Optional search Input
  Category sections: DNS Health | Email | Website | Domain
  Grid of Cards: title, one-line desc, link → T2 routes
  (Future: driven by tool registry metadata)
```

**shadcn:** `Input`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`.

**Phase 1:** static cards for shipped + “coming soon” placeholders.

---

## Template index

| ID | Name | Primary route |
|----|------|----------------|
| T1 | DNS health home | `/` |
| T2 | Generic tool | `/tools/{slug}` |
| T3 | Bulk table | `/tools/bulk-dns-health` |
| T4 | Mail tester | `/tools/mail-tester` |
| T5 | Dashboard | `/dashboard` |
| T6 | Tools hub | `/tools` |
