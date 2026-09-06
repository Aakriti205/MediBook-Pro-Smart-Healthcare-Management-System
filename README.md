# 🏥 MediBook Pro — Advanced Full Stack MERN

## 🚀 Quick Start

```bash
# 1. Start Backend
cd backend && npm install && npm run dev

# 2. Seed Database (FIRST TIME ONLY)
cd backend && npm run seed

# 3. Start Frontend
cd frontend && npm install && npm start
```

---

## 🔑 Login Credentials (all password: `password123`)

### Admin
| Email | Role |
|-------|------|
| admin@medibook.com | Admin |

### Patients (10 accounts)
| Email | Location |
|-------|----------|
| vinuthna@gmail.com | Hyderabad |
| rahul@gmail.com | Bangalore |
| kamala@gmail.com | Chennai |
| arjun@gmail.com | Mumbai |
| priya.nair@gmail.com | Kochi |
| sanjay@gmail.com | Ahmedabad |
| divya@gmail.com | Trivandrum |
| rohan@gmail.com | Delhi |
| ananya@gmail.com | Lucknow |
| vikram@gmail.com | Pune |

### Doctors (12 accounts)
| Email | Specialty | City | Locality |
|-------|-----------|------|----------|
| dr.priya@medibook.com | Cardiologist | Chennai | Greams Road |
| dr.meena@medibook.com | Gynecologist | Chennai | Anna Nagar |
| dr.kavitha@medibook.com | Dermatologist | Chennai | Manapakkam |
| dr.ramesh@medibook.com | Orthopedic | Hyderabad | Secunderabad |
| dr.suresh@medibook.com | Pediatrician | Hyderabad | Banjara Hills |
| dr.manoj@medibook.com | Psychiatrist | Hyderabad | Somajiguda |
| dr.arvind@medibook.com | Neurologist | Bangalore | Cunningham Road |
| dr.shalini@medibook.com | Ophthalmologist | Bangalore | Rajajinagar |
| dr.vikas@medibook.com | ENT Specialist | Bangalore | Hebbal |
| dr.sneha@medibook.com | Dermatologist | Mumbai | Bandra |
| dr.anil@medibook.com | Gastroenterologist | Mumbai | Pedder Road |
| dr.rupa@medibook.com | Endocrinologist | Mumbai | Mahim |

---

## ✨ Features

### Patient
- OTP-verified registration (6-digit animated boxes)
- Password show/hide toggle on login
- Search doctors by city, locality, specialty, rating, fee
- Real-time slot booking with conflict detection
- Book new/follow-up appointments (in-person or online)
- Pay with UPI/Card/Net Banking/Cash + coupon codes
- Cancel, reschedule appointments
- Rate & review doctors after completion
- Notification bell with unread count
- Payment history & receipts
- Profile + password management

### Doctor Portal (/doctor)
- Doctor dashboard with today's schedule
- Confirm / Complete / Cancel appointments
- Write prescriptions with medicine list
- Record patient vitals (BP, pulse, temperature, weight)
- Set follow-up dates
- View all patients with visit history
- Toggle availability (available/unavailable)
- Monthly appointment chart
- Edit profile, fees, bio

### Admin
- Full stats dashboard
- Appointments management with status control
- Add/delete doctors
- User management (activate/deactivate)
- Revenue analytics (Bar + Line + Pie charts)
- Reminders panel — run now, view upcoming
- Broadcast notifications

### System
- JWT + Refresh Token auth
- OTP email verification on register
- Automatic 24h + 1h appointment reminders
- Role-based access (patient / doctor / admin)
- Rate limiting + Helmet security
- Locality-based doctor search (12 doctors across 4 cities)

---

## 🗄️ MongoDB Compass

1. Connect to `mongodb://localhost:27017`
2. Run `npm run seed` in backend
3. Refresh Compass → see `medibook_pro` database

**Collections:**
- `users` — 23 users (1 admin + 10 patients + 12 doctors)
- `doctors` — 12 verified doctors with localities
- `appointments` — 10 sample appointments
- `payments` — 6 payment records
- `notifications` — 11 notifications

---

## 📧 Enable Email (OTP + Reminders)

Add to `backend/.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=MediBook Pro <your_gmail@gmail.com>
```

> Without email config: OTP is printed in the backend terminal console.
> Get App Password: Google Account → Security → 2-Step Verification → App Passwords
