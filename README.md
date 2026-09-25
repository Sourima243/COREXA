# COREXA
COREXA is a smart medication and healthcare management application designed to help users manage their medicines, prescriptions, and health records efficiently. It provides medication reminders, dosage tracking, medicine information, and secure health record management, making everyday healthcare simpler, organized, and accessible.

The primary objective of COREXA is to reduce missed medications, improve medication adherence, and make essential health-related information easily accessible to users. Through an intuitive interface, users can add their prescribed medicines, set dosage schedules, receive timely reminders, and maintain a digital record of their medications.

Key Features
💊 Medicine Management – Add, update, and manage medicines along with dosage and timing.
⏰ Medication Reminders – Sends reminders when it is time to take a prescribed medicine.
📋 Prescription Management – Helps users store and organize prescription-related information.
🏥 Health Records – Maintains important medical and medication records in one place.
🔎 Medicine Information – Provides information about medicines, including their purpose and general usage details.
👨‍⚕️ Doctor/Healthcare Information – Allows users to maintain relevant healthcare-provider details.
📊 Medication Tracking – Helps users monitor their medication schedules and adherence.
🔐 Secure User Account – Protects personal healthcare information through authenticated access.
📱 User-Friendly Interface – Designed for simple and convenient navigation across different age groups.
Objective:

The main objective of COREXA is to create a digital healthcare companion that simplifies medication management and encourages users to follow their prescribed medication schedules consistently.

Project Vision:

COREXA aims to bridge the gap between technology and everyday healthcare management by providing a convenient, organized, and accessible platform for medication-related needs. It is designed as a supportive tool for users and should complement—not replace—professional medical advice.

- **Patients** — log vitals (blood pressure, heart rate, glucose, weight, temperature, oxygen saturation) and symptoms; view prescribed medications and doctor notes.
- **Doctors** — view their assigned patients, review vitals/symptoms trends, prescribe medications, and add clinical notes.
- **Admin** — manage all users, activate/deactivate accounts, and assign patients to doctors.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MongoDB (Mongoose) · JWT auth

## Project structure

```
healthcare-app/
├── backend/          Express API + MongoDB models
└── frontend/         React + Tailwind client
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (local or Atlas) and a strong JWT_SECRET
npm run dev          # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas connection string).

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

By default the frontend calls the API at `http://localhost:5000/api`. To change this, create a `frontend/.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

## 3. Using the app

1. Go to `http://localhost:5173/register` and create a few accounts:
   - One as **Admin**
   - One or more as **Doctor** (add a specialization)
   - One or more as **Patient**
2. Log in as **Admin** → assign each patient to a doctor from the Admin Panel.
3. Log in as a **Patient** → log vitals and symptoms; view them chart over time.
4. Log in as the assigned **Doctor** → view the patient's data, prescribe medications, and add clinical notes.
5. Log back in as the **Patient** → see the prescribed medications and doctor's notes.

> Note: in this demo, users self-select their role at signup for convenience. In a real deployment, doctor and admin accounts should be provisioned by an administrator rather than self-registered.

## API overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, get JWT |
| GET | `/api/auth/me` | Authenticated | Current user profile |
| POST | `/api/vitals` | Patient | Log a vital reading |
| GET | `/api/vitals/patient/:id` | Self / assigned doctor / admin | Get vitals history |
| POST | `/api/symptoms` | Patient | Log a symptom |
| GET | `/api/symptoms/patient/:id` | Self / assigned doctor / admin | Get symptom history |
| POST | `/api/medications` | Doctor/Admin | Prescribe a medication |
| GET | `/api/medications/patient/:id` | Self / assigned doctor / admin | Get medication list |
| POST | `/api/notes` | Doctor | Add a clinical note |
| GET | `/api/notes/patient/:id` | Self / assigned doctor / admin | Get clinical notes |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/my-patients` | Doctor | List assigned patients |
| PATCH | `/api/users/:id/assign-doctor` | Admin | Assign/unassign a doctor |
| PATCH | `/api/users/:id/status` | Admin | Activate/deactivate a user |

## Security notes for production

- Passwords are hashed with bcrypt; JWTs expire (default 7 days).
- All patient data routes check that the requester is the patient themselves, their assigned doctor, or an admin.
- Before going to production: add HTTPS, rate limiting, input sanitization, refresh tokens, audit logging, and — since this handles health data — review HIPAA/GDPR compliance requirements for your jurisdiction.

