If this is **only for your own use** (not as a SaaS product), you can keep the MVP simple while still making it reliable. The plan below assumes you are using the **official WhatsApp Cloud API** and will message only people you are allowed to contact.

---

# WhatsApp Personal Scheduler MVP

## Goal

A private web application where **only you** can:

* Store contacts
* Write messages
* Schedule messages
* Send to one or many contacts
* Track whether messages were sent successfully

---

# Tech Stack

| Category       | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | Next.js 15 + TypeScript +nextauth |
| UI             | Tailwind CSS + shadcn/ui          |
| Authentication | nextauth |
| Database       | PostgreSQL + Prisma               |
| Scheduler      | node-cron (VPS)                   |
| WhatsApp       | WhatsApp Cloud API                |
| File Upload    | CSV Parser                        |
| Deployment     | VPS (recommended)                 |

---

# Pages

```
/
├── Login
├── Dashboard
├── Contacts
├── Messages
├── Templates
├── Schedule
├── History
├── Settings
└── Profile
```

---

# Login

Features

* Email
* Password
* Forgot Password (optional)

Since it's only for you:

```
Email

Password

Login
```

No registration page.

---

# Dashboard

Cards

```
Total Contacts

Scheduled Today

Sent Today

Failed Today

Pending

Templates

API Status
```

Recent Activity

```
✔ Sent to Rahul

✔ Sent to Aman

✖ Failed to Mohit

⏳ Scheduled Tomorrow
```

Quick Actions

```
Add Contact

New Schedule

Send Now

Upload CSV
```

---

# Contacts

Fields

```
Name

Phone

Tags

Notes

Created At
```

Functions

* Add
* Edit
* Delete
* Search
* Import CSV
* Export CSV

Bulk Select

```
☑ Select All

☑ Family

☑ Clients

☑ Friends
```

---

# Templates

Example

```
Good Morning

Hello {{name}}

Have a wonderful day!
```

Variables

```
{{name}}

{{phone}}

{{date}}

{{time}}
```

Functions

* Create
* Duplicate
* Delete
* Preview

---

# Compose Message

Screen

```
Recipients

Message

Variables Preview

Character Count

Estimated Send Time

Template Dropdown
```

Buttons

```
Send Now

Schedule
```

---

# Schedule

Fields

```
Recipients

Template

Custom Message

Date

Time

Timezone
```

Options

```
One Time

Daily

Weekly

Monthly
```

Future enhancement:

```
Every Monday

Every Friday

Every Month
```

---

# Scheduler

Every minute

```
Check Database

↓

Find Pending Messages

↓

Send

↓

Update Status

↓

Save Log
```

---

# History

Columns

```
Recipient

Message

Status

Sent Time

Error

Retry
```

Filters

```
Today

Yesterday

Last 7 Days

Failed

Successful
```

---

# Logs

```
INFO

ERROR

API Response

Webhook Response

Retry Count
```

---

# Settings

WhatsApp

```
Access Token

Phone Number ID

Webhook Verify Token
```

Scheduler

```
Timezone

Retry Attempts

Retry Delay
```

Security

```
Change Password

Logout

Backup Database
```

---

# Database

## Contacts

```
id

name

phone

tag

notes

createdAt
```

---

## Templates

```
id

name

content

createdAt
```

---

## Schedules

```
id

templateId

sendAt

status

repeat

createdAt
```

---

## Recipients

```
id

scheduleId

contactId

status

messageId

error
```

---

## Logs

```
id

recipientId

request

response

createdAt
```

---

# API Routes

```
POST /api/contact

GET /api/contact

PUT /api/contact/:id

DELETE /api/contact/:id

POST /api/template

GET /api/template

POST /api/schedule

GET /api/history

POST /api/send

POST /api/webhook

GET /api/cron
```

---

# Cron Flow

```
Every Minute

↓

SELECT
status='PENDING'
sendAt <= now()

↓

Loop

↓

Send Message

↓

Success

↓

Update Status SENT

↓

Else

FAILED
```

---

# CSV Import

Columns

```
Name

Phone

Tag
```

Example

```
Rahul,+919876543210,Client

Amit,+919123456789,Friend
```

---

# Future Features (Post-MVP)

* Excel import/export
* Message queue (BullMQ + Redis)
* Image, PDF, and document messages
* Template analytics
* Contact groups
* Birthday reminders
* Google Contacts sync
* Calendar integration
* AI-assisted message generation
* Dark mode
* Audit logs

---

# Suggested Project Structure

```
app/
├── (auth)
│   └── login
│
├── dashboard
├── contacts
├── templates
├── compose
├── schedules
├── history
├── settings
│
├── api
│   ├── contacts
│   ├── templates
│   ├── schedule
│   ├── send
│   ├── cron
│   └── webhook
│
components/
lib/
prisma/
hooks/
types/
utils/
```

---

# Development Phases

### Phase 1 (Core)

* Login
* Contacts CRUD
* Template CRUD
* Send single message
* Schedule one-time message
* History page

### Phase 2

* CSV import
* Bulk recipients
* Search and filters
* Retry failed messages
* Dashboard statistics

### Phase 3

* Recurring schedules
* Media messages (where supported by the API)
* Queue processing
* Notifications
* Backup and restore

