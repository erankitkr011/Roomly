import axiosInstance from "../utils/axiosInstance";

const dashboardService = {
  getStats: () => axiosInstance.get("/dashboard/stats"),
};

export default dashboardService;
