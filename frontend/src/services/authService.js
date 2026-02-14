import axiosInstance from "../utils/axiosInstance";

const authService = {
  sendOtp: (email) => axiosInstance.post("/auth/send-otp", { email }),

  signup: (data) => axiosInstance.post("/auth/signup", data),

  login: (email, password) => axiosInstance.post("/auth/login", { email, password }),

  logout: () => axiosInstance.post("/auth/logout"),

  changePassword: (data) => axiosInstance.put("/auth/change-password", data),

  resetPasswordToken: (email) => axiosInstance.post("/auth/reset-password-token", { email }),

  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),
};

export default authService;
