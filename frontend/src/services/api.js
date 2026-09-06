import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use(req => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const { data } = await axios.post("http://localhost:5000/api/auth/refresh", { refreshToken: refresh });
          localStorage.setItem("token", data.token);
          err.config.headers.Authorization = `Bearer ${data.token}`;
          return API(err.config);
        } catch { localStorage.clear(); window.location.href = "/login"; }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = d => API.post("/auth/register", d);
export const login = d => API.post("/auth/login", d);
export const logout = () => API.post("/auth/logout");
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = d => API.put("/auth/profile", d);
export const changePassword = d => API.put("/auth/change-password", d);

// Doctors
export const getDoctors = p => API.get("/doctors", { params: p });
export const getDoctorById = id => API.get(`/doctors/${id}`);
export const getSpecialties = () => API.get("/doctors/specialties");
export const getAvailableSlots = (id, date) => API.get(`/doctors/${id}/slots`, { params: { date } });
export const addReview = (id, d) => API.post(`/doctors/${id}/reviews`, d);
export const createDoctor = d => API.post("/doctors", d);
export const updateDoctor = (id, d) => API.put(`/doctors/${id}`, d);
export const deleteDoctor = id => API.delete(`/doctors/${id}`);

// Appointments
export const bookAppointment = d => API.post("/appointments", d);
export const getMyAppointments = p => API.get("/appointments/my", { params: p });
export const getAppointmentById = id => API.get(`/appointments/${id}`);
export const cancelAppointment = (id, d) => API.put(`/appointments/${id}/cancel`, d);
export const rescheduleAppointment = (id, d) => API.put(`/appointments/${id}/reschedule`, d);
export const updateAppointmentStatus = (id, d) => API.put(`/appointments/${id}/status`, d);
export const rateAppointment = (id, d) => API.post(`/appointments/${id}/rate`, d);
export const getAllAppointments = p => API.get("/appointments", { params: p });

// Payments
export const createPayment = d => API.post("/payments", d);
export const getMyPayments = () => API.get("/payments/my");
export const getPaymentStats = () => API.get("/payments/stats");
export const refundPayment = (id, d) => API.post(`/payments/${id}/refund`, d);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const markAllRead = () => API.put("/notifications/read-all");
export const deleteNotification = id => API.delete(`/notifications/${id}`);

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAllUsers = p => API.get("/admin/users", { params: p });
export const toggleUserStatus = id => API.put(`/admin/users/${id}/toggle`);
export const broadcast = d => API.post("/admin/broadcast", d);

// Reminders
export const triggerReminders = () => API.post("/reminders/trigger");
export const sendTestReminder = (userId) => API.post("/reminders/test", { userId });
export const getUpcomingReminders = () => API.get("/reminders/upcoming");

// OTP
export const sendOTP = (d) => API.post("/auth/send-otp", d);
export const verifyOTP = (d) => API.post("/auth/verify-otp", d);
export const resendOTP = (d) => API.post("/auth/resend-otp", d);

// Doctor Portal
export const getDoctorPortalProfile = () => API.get("/doctor-portal/profile");
export const updateDoctorPortalProfile = (d) => API.put("/doctor-portal/profile", d);
export const getDoctorAppointments = (p) => API.get("/doctor-portal/appointments", { params: p });
export const getTodayAppointments = () => API.get("/doctor-portal/appointments/today");
export const confirmDoctorAppointment = (id) => API.put(`/doctor-portal/appointments/${id}/confirm`);
export const completeDoctorAppointment = (id, d) => API.put(`/doctor-portal/appointments/${id}/complete`, d);
export const cancelDoctorAppointment = (id, d) => API.put(`/doctor-portal/appointments/${id}/cancel`, d);
export const getDoctorStats = () => API.get("/doctor-portal/stats");
export const getDoctorPatients = () => API.get("/doctor-portal/patients");
export const updateDoctorAvailability = (d) => API.put("/doctor-portal/availability", d);
