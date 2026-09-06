require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Clearing collections...");
  await Promise.all([User.deleteMany(), Doctor.deleteMany(), Appointment.deleteMany(), Payment.deleteMany(), Notification.deleteMany()]);

  const PWD = "password123"; // Mongoose pre-save hook will hash this

  // ── USERS ──────────────────────────────────────────────
  const admin = await User.create({ name: "Admin User", email: "admin@medibook.com", password: PWD, role: "admin", phone: "9000000001", gender: "male", age: 40, isActive: true, isVerified: true });
  const p1  = await User.create({ name: "Vinuthna Reddy",   email: "vinuthna@gmail.com",    password: PWD, role: "patient", phone: "9876543210", gender: "female", age: 22, bloodGroup: "B+",  address: "Hyderabad", isActive: true, isVerified: true });
  const p2  = await User.create({ name: "Rahul Sharma",     email: "rahul@gmail.com",        password: PWD, role: "patient", phone: "9123456780", gender: "male",   age: 30, bloodGroup: "O+",  address: "Bangalore", isActive: true, isVerified: true });
  const p3  = await User.create({ name: "Kamala Charishka", email: "kamala@gmail.com",       password: PWD, role: "patient", phone: "9988776655", gender: "female", age: 21, bloodGroup: "A+",  address: "Chennai",   isActive: true, isVerified: true });
  const p4  = await User.create({ name: "Arjun Mehta",      email: "arjun@gmail.com",        password: PWD, role: "patient", phone: "9876512340", gender: "male",   age: 35, bloodGroup: "AB+", address: "Mumbai",    isActive: true, isVerified: true });
  const p5  = await User.create({ name: "Priya Nair",       email: "priya.nair@gmail.com",   password: PWD, role: "patient", phone: "9812345670", gender: "female", age: 28, bloodGroup: "A-",  address: "Kochi",     isActive: true, isVerified: true });
  const p6  = await User.create({ name: "Sanjay Patel",     email: "sanjay@gmail.com",       password: PWD, role: "patient", phone: "9900112233", gender: "male",   age: 45, bloodGroup: "O-",  address: "Ahmedabad", isActive: true, isVerified: true });
  const p7  = await User.create({ name: "Divya Menon",      email: "divya@gmail.com",        password: PWD, role: "patient", phone: "9871234560", gender: "female", age: 26, bloodGroup: "B-",  address: "Trivandrum",isActive: true, isVerified: true });
  const p8  = await User.create({ name: "Rohan Gupta",      email: "rohan@gmail.com",        password: PWD, role: "patient", phone: "9823456701", gender: "male",   age: 32, bloodGroup: "AB-", address: "Delhi",     isActive: true, isVerified: true });
  const p9  = await User.create({ name: "Ananya Singh",     email: "ananya@gmail.com",       password: PWD, role: "patient", phone: "9765432100", gender: "female", age: 24, bloodGroup: "O+",  address: "Lucknow",   isActive: true, isVerified: true });
  const p10 = await User.create({ name: "Vikram Rao",       email: "vikram@gmail.com",       password: PWD, role: "patient", phone: "9845671230", gender: "male",   age: 50, bloodGroup: "A+",  address: "Pune",      isActive: true, isVerified: true });

  // Doctor user accounts
  const du1  = await User.create({ name: "Dr. Priya Sharma",   email: "dr.priya@medibook.com",   password: PWD, role: "doctor", phone: "9811001100", gender: "female", isActive: true, isVerified: true });
  const du2  = await User.create({ name: "Dr. Arvind Kumar",   email: "dr.arvind@medibook.com",  password: PWD, role: "doctor", phone: "9822002200", gender: "male",   isActive: true, isVerified: true });
  const du3  = await User.create({ name: "Dr. Sneha Patel",    email: "dr.sneha@medibook.com",   password: PWD, role: "doctor", phone: "9833003300", gender: "female", isActive: true, isVerified: true });
  const du4  = await User.create({ name: "Dr. Ramesh Nair",    email: "dr.ramesh@medibook.com",  password: PWD, role: "doctor", phone: "9844004400", gender: "male",   isActive: true, isVerified: true });
  const du5  = await User.create({ name: "Dr. Meena Iyer",     email: "dr.meena@medibook.com",   password: PWD, role: "doctor", phone: "9855005500", gender: "female", isActive: true, isVerified: true });
  const du6  = await User.create({ name: "Dr. Suresh Reddy",   email: "dr.suresh@medibook.com",  password: PWD, role: "doctor", phone: "9866006600", gender: "male",   isActive: true, isVerified: true });
  const du7  = await User.create({ name: "Dr. Kavitha Rao",    email: "dr.kavitha@medibook.com", password: PWD, role: "doctor", phone: "9877007700", gender: "female", isActive: true, isVerified: true });
  const du8  = await User.create({ name: "Dr. Anil Desai",     email: "dr.anil@medibook.com",    password: PWD, role: "doctor", phone: "9888008800", gender: "male",   isActive: true, isVerified: true });
  const du9  = await User.create({ name: "Dr. Shalini Gupta",  email: "dr.shalini@medibook.com", password: PWD, role: "doctor", phone: "9899009900", gender: "female", isActive: true, isVerified: true });
  const du10 = await User.create({ name: "Dr. Manoj Pillai",   email: "dr.manoj@medibook.com",   password: PWD, role: "doctor", phone: "9810001000", gender: "male",   isActive: true, isVerified: true });
  const du11 = await User.create({ name: "Dr. Rupa Bose",      email: "dr.rupa@medibook.com",    password: PWD, role: "doctor", phone: "9821001100", gender: "female", isActive: true, isVerified: true });
  const du12 = await User.create({ name: "Dr. Vikas Joshi",    email: "dr.vikas@medibook.com",   password: PWD, role: "doctor", phone: "9832001200", gender: "male",   isActive: true, isVerified: true });

  const mkSlots = (days) => days.map(day => [
    { day, startTime: "09:00", endTime: "13:00", maxPatients: 8 },
    { day, startTime: "14:00", endTime: "18:00", maxPatients: 8 }
  ]).flat();

  const mwf  = mkSlots(["Monday","Wednesday","Friday"]);
  const tts  = mkSlots(["Tuesday","Thursday","Saturday"]);
  const mttf = mkSlots(["Monday","Tuesday","Thursday","Friday"]);
  const all6 = mkSlots(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]);

  // ── DOCTORS (locality specific) ────────────────────────
  const doctors = await Doctor.insertMany([
    // ── CHENNAI ──
    {
      user: du1._id, name: "Dr. Priya Sharma", specialty: "Cardiologist",
      subSpecialty: "Interventional Cardiology",
      hospital: "Apollo Hospitals", department: "Cardiology",
      email: "dr.priya@medibook.com", phone: "9811001100", experience: 12,
      qualifications: ["MBBS","MD Cardiology","DM"], location: "Chennai",
      locality: "Greams Road, Chennai", about: "Specialist in heart disease, hypertension and cardiac surgery with 12 years at Apollo.",
      consultationFee: 800, followUpFee: 400, availableSlots: mwf,
      rating: 4.8, totalReviews: 127, totalPatients: 934,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Tamil"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du5._id, name: "Dr. Meena Iyer", specialty: "Gynecologist",
      subSpecialty: "High-Risk Pregnancy",
      hospital: "Rainbow Children's Hospital", department: "Obstetrics & Gynecology",
      email: "dr.meena@medibook.com", phone: "9855005500", experience: 10,
      qualifications: ["MBBS","MS Obstetrics & Gynecology","Fellowship"],
      location: "Chennai", locality: "Anna Nagar, Chennai",
      about: "Expert in high-risk pregnancies, PCOS, and laparoscopic surgeries with 10 years experience.",
      consultationFee: 700, followUpFee: 350, availableSlots: tts,
      rating: 4.5, totalReviews: 204, totalPatients: 1456,
      isAvailable: true, isVerified: true, languages: ["English","Tamil","Telugu"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du7._id, name: "Dr. Kavitha Rao", specialty: "Dermatologist",
      subSpecialty: "Cosmetic Dermatology",
      hospital: "MIOT International", department: "Dermatology",
      email: "dr.kavitha@medibook.com", phone: "9877007700", experience: 7,
      qualifications: ["MBBS","MD Dermatology"],
      location: "Chennai", locality: "Manapakkam, Chennai",
      about: "Specialist in acne, hair loss, vitiligo, and advanced cosmetic skin procedures.",
      consultationFee: 600, followUpFee: 300, availableSlots: mwf,
      rating: 4.6, totalReviews: 89, totalPatients: 520,
      isAvailable: true, isVerified: true, languages: ["English","Tamil"],
      consultationType: { inPerson: true, online: false }
    },

    // ── HYDERABAD ──
    {
      user: du4._id, name: "Dr. Ramesh Nair", specialty: "Orthopedic Surgeon",
      subSpecialty: "Joint Replacement",
      hospital: "KIMS Hospitals", department: "Orthopedics",
      email: "dr.ramesh@medibook.com", phone: "9844004400", experience: 20,
      qualifications: ["MBBS","MS Orthopedics","Fellowship Joint Replacement"],
      location: "Hyderabad", locality: "Secunderabad, Hyderabad",
      about: "Expert in knee and hip replacement surgery. Over 2000 successful joint replacement surgeries.",
      consultationFee: 900, followUpFee: 450, availableSlots: mttf,
      rating: 4.7, totalReviews: 156, totalPatients: 1087,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Telugu","Malayalam"],
      consultationType: { inPerson: true, online: false }
    },
    {
      user: du6._id, name: "Dr. Suresh Reddy", specialty: "Pediatrician",
      subSpecialty: "Neonatology",
      hospital: "Care Hospitals", department: "Pediatrics",
      email: "dr.suresh@medibook.com", phone: "9866006600", experience: 9,
      qualifications: ["MBBS","MD Pediatrics","Fellowship Neonatology"],
      location: "Hyderabad", locality: "Banjara Hills, Hyderabad",
      about: "Expert in child health, neonatal care and developmental pediatrics for 9 years.",
      consultationFee: 500, followUpFee: 250, availableSlots: all6,
      rating: 4.4, totalReviews: 312, totalPatients: 2103,
      isAvailable: true, isVerified: true, languages: ["English","Telugu","Hindi"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du10._id, name: "Dr. Manoj Pillai", specialty: "Psychiatrist",
      subSpecialty: "Cognitive Behavioural Therapy",
      hospital: "Yashoda Hospitals", department: "Psychiatry",
      email: "dr.manoj@medibook.com", phone: "9810001000", experience: 11,
      qualifications: ["MBBS","MD Psychiatry","Fellowship CBT"],
      location: "Hyderabad", locality: "Somajiguda, Hyderabad",
      about: "Specialist in anxiety, depression, OCD, PTSD and addiction counselling.",
      consultationFee: 800, followUpFee: 400, availableSlots: tts,
      rating: 4.9, totalReviews: 98, totalPatients: 430,
      isAvailable: true, isVerified: true, languages: ["English","Telugu","Hindi","Malayalam"],
      consultationType: { inPerson: true, online: true }
    },

    // ── BANGALORE ──
    {
      user: du2._id, name: "Dr. Arvind Kumar", specialty: "Neurologist",
      subSpecialty: "Epilepsy & Stroke",
      hospital: "Fortis Hospital", department: "Neurology",
      email: "dr.arvind@medibook.com", phone: "9822002200", experience: 15,
      qualifications: ["MBBS","MD Neurology","DM Neurology","Fellowship"],
      location: "Bangalore", locality: "Cunningham Road, Bangalore",
      about: "Expert in stroke management, epilepsy, Parkinson's and movement disorders.",
      consultationFee: 1000, followUpFee: 500, availableSlots: mttf,
      rating: 4.9, totalReviews: 213, totalPatients: 1204,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Kannada"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du9._id, name: "Dr. Shalini Gupta", specialty: "Ophthalmologist",
      subSpecialty: "Retinal Surgery",
      hospital: "Narayana Nethralaya", department: "Ophthalmology",
      email: "dr.shalini@medibook.com", phone: "9899009900", experience: 14,
      qualifications: ["MBBS","MS Ophthalmology","Fellowship Vitreoretinal"],
      location: "Bangalore", locality: "Rajajinagar, Bangalore",
      about: "Specialist in retinal disorders, cataract surgery, glaucoma and LASIK.",
      consultationFee: 700, followUpFee: 350, availableSlots: mwf,
      rating: 4.7, totalReviews: 142, totalPatients: 876,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Kannada"],
      consultationType: { inPerson: true, online: false }
    },
    {
      user: du12._id, name: "Dr. Vikas Joshi", specialty: "ENT Specialist",
      subSpecialty: "Head & Neck Surgery",
      hospital: "Columbia Asia Hospital", department: "ENT",
      email: "dr.vikas@medibook.com", phone: "9832001200", experience: 8,
      qualifications: ["MBBS","MS ENT","Fellowship Head & Neck"],
      location: "Bangalore", locality: "Hebbal, Bangalore",
      about: "Expert in sinus surgery, hearing loss, cochlear implants and throat disorders.",
      consultationFee: 600, followUpFee: 300, availableSlots: tts,
      rating: 4.5, totalReviews: 76, totalPatients: 394,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Kannada","Marathi"],
      consultationType: { inPerson: true, online: false }
    },

    // ── MUMBAI ──
    {
      user: du3._id, name: "Dr. Sneha Patel", specialty: "Dermatologist",
      subSpecialty: "Cosmetic & Laser Dermatology",
      hospital: "Lilavati Hospital", department: "Dermatology",
      email: "dr.sneha@medibook.com", phone: "9833003300", experience: 8,
      qualifications: ["MBBS","MD Dermatology"],
      location: "Mumbai", locality: "Bandra, Mumbai",
      about: "Specialist in skin conditions, acne, hair loss, anti-aging and laser treatments.",
      consultationFee: 1000, followUpFee: 500, availableSlots: mwf,
      rating: 4.6, totalReviews: 189, totalPatients: 972,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Gujarati","Marathi"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du8._id, name: "Dr. Anil Desai", specialty: "Gastroenterologist",
      subSpecialty: "Hepatology",
      hospital: "Jaslok Hospital", department: "Gastroenterology",
      email: "dr.anil@medibook.com", phone: "9888008800", experience: 16,
      qualifications: ["MBBS","MD Medicine","DM Gastroenterology"],
      location: "Mumbai", locality: "Pedder Road, Mumbai",
      about: "Expert in liver diseases, IBS, Crohn's disease, colonoscopy and endoscopy.",
      consultationFee: 1200, followUpFee: 600, availableSlots: mttf,
      rating: 4.8, totalReviews: 167, totalPatients: 1120,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Gujarati","Marathi"],
      consultationType: { inPerson: true, online: true }
    },
    {
      user: du11._id, name: "Dr. Rupa Bose", specialty: "Endocrinologist",
      subSpecialty: "Diabetes & Thyroid",
      hospital: "Hinduja Hospital", department: "Endocrinology",
      email: "dr.rupa@medibook.com", phone: "9821001100", experience: 13,
      qualifications: ["MBBS","MD Medicine","DM Endocrinology"],
      location: "Mumbai", locality: "Mahim, Mumbai",
      about: "Specialist in diabetes management, thyroid disorders, PCOS and hormonal imbalances.",
      consultationFee: 900, followUpFee: 450, availableSlots: tts,
      rating: 4.7, totalReviews: 134, totalPatients: 890,
      isAvailable: true, isVerified: true, languages: ["English","Hindi","Bengali"],
      consultationType: { inPerson: true, online: true }
    },
  ]);

  // ── APPOINTMENTS ────────────────────────────────────────
  const apt1  = await Appointment.create({ patient: p1._id,  doctor: doctors[0]._id, date: new Date("2025-05-10"), timeSlot: "10:00 AM", status: "confirmed",  reason: "Chest pain", symptoms: ["chest pain","breathlessness"], type: "new",      mode: "in-person", fee: 800,  paymentStatus: "paid",   queueNumber: 3 });
  const apt2  = await Appointment.create({ patient: p2._id,  doctor: doctors[6]._id, date: new Date("2025-05-12"), timeSlot: "03:00 PM", status: "pending",    reason: "Severe headache",                                      type: "new",      mode: "in-person", fee: 1000, paymentStatus: "unpaid", queueNumber: 1 });
  const apt3  = await Appointment.create({ patient: p3._id,  doctor: doctors[1]._id, date: new Date("2025-05-08"), timeSlot: "11:00 AM", status: "completed",  reason: "Routine checkup",                                      type: "new",      mode: "in-person", fee: 700,  paymentStatus: "paid",   queueNumber: 2, rating: 5, review: "Excellent doctor!" });
  const apt4  = await Appointment.create({ patient: p4._id,  doctor: doctors[3]._id, date: new Date("2025-05-14"), timeSlot: "09:00 AM", status: "confirmed",  reason: "Knee pain",   symptoms: ["knee pain","swelling"],        type: "new",      mode: "in-person", fee: 900,  paymentStatus: "paid",   queueNumber: 1 });
  const apt5  = await Appointment.create({ patient: p5._id,  doctor: doctors[1]._id, date: new Date("2025-05-16"), timeSlot: "10:00 AM", status: "pending",    reason: "Pregnancy checkup",                                    type: "new",      mode: "in-person", fee: 700,  paymentStatus: "unpaid", queueNumber: 2 });
  const apt6  = await Appointment.create({ patient: p6._id,  doctor: doctors[4]._id, date: new Date("2025-05-09"), timeSlot: "02:00 PM", status: "completed",  reason: "Child fever",                                          type: "new",      mode: "in-person", fee: 500,  paymentStatus: "paid",   queueNumber: 4, rating: 4, review: "Very caring doctor." });
  const apt7  = await Appointment.create({ patient: p7._id,  doctor: doctors[0]._id, date: new Date("2025-05-18"), timeSlot: "11:00 AM", status: "confirmed",  reason: "Heart palpitations",                                   type: "followup", mode: "online",    fee: 400,  paymentStatus: "paid",   queueNumber: 5 });
  const apt8  = await Appointment.create({ patient: p8._id,  doctor: doctors[6]._id, date: new Date("2025-05-07"), timeSlot: "03:00 PM", status: "cancelled",  reason: "Migraine",                                             type: "new",      mode: "in-person", fee: 1000, paymentStatus: "unpaid", queueNumber: 3, cancellationReason: "Schedule conflict", cancelledBy: "patient" });
  const apt9  = await Appointment.create({ patient: p9._id,  doctor: doctors[2]._id, date: new Date("2025-05-20"), timeSlot: "04:00 PM", status: "pending",    reason: "Acne treatment",                                       type: "new",      mode: "in-person", fee: 600,  paymentStatus: "unpaid", queueNumber: 2 });
  const apt10 = await Appointment.create({ patient: p10._id, doctor: doctors[3]._id, date: new Date("2025-05-06"), timeSlot: "09:00 AM", status: "completed",  reason: "Hip replacement followup",                             type: "followup", mode: "in-person", fee: 450,  paymentStatus: "paid",   queueNumber: 1, rating: 5, review: "Dr. Ramesh is outstanding!" });

  // ── PAYMENTS ────────────────────────────────────────────
  await Payment.create({ appointment: apt1._id,  patient: p1._id,  doctor: doctors[0]._id, amount: 944,  method: "upi",        status: "success", transactionId: "TXN-001", tax: 144, paidAt: new Date(), receipt: "RCP-001", invoice: { number: "INV-001", generatedAt: new Date() } });
  await Payment.create({ appointment: apt3._id,  patient: p3._id,  doctor: doctors[1]._id, amount: 826,  method: "card",       status: "success", transactionId: "TXN-002", tax: 126, paidAt: new Date(), receipt: "RCP-002", invoice: { number: "INV-002", generatedAt: new Date() } });
  await Payment.create({ appointment: apt4._id,  patient: p4._id,  doctor: doctors[3]._id, amount: 1062, method: "netbanking", status: "success", transactionId: "TXN-003", tax: 162, paidAt: new Date(), receipt: "RCP-003", invoice: { number: "INV-003", generatedAt: new Date() } });
  await Payment.create({ appointment: apt6._id,  patient: p6._id,  doctor: doctors[4]._id, amount: 590,  method: "upi",        status: "success", transactionId: "TXN-004", tax: 90,  paidAt: new Date(), receipt: "RCP-004", invoice: { number: "INV-004", generatedAt: new Date() } });
  await Payment.create({ appointment: apt7._id,  patient: p7._id,  doctor: doctors[0]._id, amount: 472,  method: "card",       status: "success", transactionId: "TXN-005", tax: 72,  paidAt: new Date(), receipt: "RCP-005", invoice: { number: "INV-005", generatedAt: new Date() } });
  await Payment.create({ appointment: apt10._id, patient: p10._id, doctor: doctors[3]._id, amount: 531,  method: "cash",       status: "success", transactionId: "TXN-006", tax: 81,  paidAt: new Date(), receipt: "RCP-006", invoice: { number: "INV-006", generatedAt: new Date() } });

  // ── NOTIFICATIONS ──────────────────────────────────────
  await Notification.insertMany([
    { user: p1._id,  title: "Appointment Confirmed",    message: "Your appointment with Dr. Priya Sharma is confirmed for May 10 at 10:00 AM.", type: "appointment", isRead: false },
    { user: p1._id,  title: "Payment Successful",       message: "Payment of ₹944 received. Receipt: RCP-001",                                  type: "payment",     isRead: true  },
    { user: p2._id,  title: "Appointment Pending",      message: "Your appointment with Dr. Arvind Kumar is awaiting confirmation.",             type: "appointment", isRead: false },
    { user: p3._id,  title: "Thank You for Your Review",message: "Thanks for rating Dr. Meena Iyer 5 stars!",                                   type: "review",      isRead: false },
    { user: p4._id,  title: "Appointment Confirmed",    message: "Your appointment with Dr. Ramesh Nair is confirmed for May 14 at 9:00 AM.",   type: "appointment", isRead: false },
    { user: p5._id,  title: "Appointment Pending",      message: "Your appointment with Dr. Meena Iyer is pending confirmation.",                type: "appointment", isRead: false },
    { user: p6._id,  title: "Appointment Completed",    message: "Your visit with Dr. Suresh Reddy is done. Please leave a review!",            type: "appointment", isRead: true  },
    { user: p7._id,  title: "Online Meeting Scheduled", message: "Your online appointment with Dr. Priya Sharma is confirmed.",                 type: "appointment", isRead: false },
    { user: p8._id,  title: "Appointment Cancelled",    message: "Your appointment with Dr. Arvind Kumar was cancelled. Reason: Schedule conflict.", type: "appointment", isRead: true },
    { user: p9._id,  title: "Welcome to MediBook Pro!", message: "Hello Ananya, your account is ready. Book your first appointment today.",      type: "system",      isRead: false },
    { user: p10._id, title: "Thank You for Your Review",message: "Thanks for rating Dr. Ramesh Nair 5 stars!",                                  type: "review",      isRead: false },
  ]);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login Credentials (password: password123)");
  console.log("┌─ Admin  : admin@medibook.com");
  console.log("├─ Patients: vinuthna@gmail.com | rahul@gmail.com | kamala@gmail.com");
  console.log("│            arjun@gmail.com | priya.nair@gmail.com | sanjay@gmail.com");
  console.log("│            divya@gmail.com | rohan@gmail.com | ananya@gmail.com | vikram@gmail.com");
  console.log("└─ Doctors : dr.priya@medibook.com | dr.arvind@medibook.com | dr.sneha@medibook.com");
  console.log("             dr.ramesh@medibook.com | dr.meena@medibook.com | dr.suresh@medibook.com");
  console.log("             dr.kavitha@medibook.com | dr.anil@medibook.com | dr.shalini@medibook.com");
  console.log("             dr.manoj@medibook.com | dr.rupa@medibook.com | dr.vikas@medibook.com");
  console.log("\n📊 Seeded: 23 users · 12 doctors · 10 appointments · 6 payments · 11 notifications");
  console.log("\n🗺  Doctors by city:");
  console.log("   Chennai   → Dr. Priya (Cardio), Dr. Meena (Gynec), Dr. Kavitha (Derma)");
  console.log("   Hyderabad → Dr. Ramesh (Ortho), Dr. Suresh (Pedia), Dr. Manoj (Psych)");
  console.log("   Bangalore → Dr. Arvind (Neuro), Dr. Shalini (Ophtha), Dr. Vikas (ENT)");
  console.log("   Mumbai    → Dr. Sneha (Derma), Dr. Anil (Gastro), Dr. Rupa (Endo)");
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
