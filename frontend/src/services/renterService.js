import axiosInstance from "../utils/axiosInstance";

const renterService = {
  // Landlord-side renter management
  addRenter: (data) => axiosInstance.post("/landlord/add-renter", data),
  updateRenter: (renterId, data) => axiosInstance.put(`/landlord/update-renter/${renterId}`, data),
  deleteRenter: (renterId) => axiosInstance.delete(`/landlord/delete-renter/${renterId}`),
  getAllRenters: () => axiosInstance.get("/landlord/all-renters"),
  getRenterBills: (renterId) => axiosInstance.get(`/landlord/renter-bills/${renterId}`),

  // Renter-side
  updateProfile: (data) => axiosInstance.put("/renter/update-profile", data),
  getAllBills: () => axiosInstance.get("/renter/all-bills"),
  getBill: (billId) => axiosInstance.get(`/renter/bill/${billId}`),
  verifyBill: (billId) => axiosInstance.post(`/renter/verify-bill/${billId}`),
  searchVacantRooms: (params) => axiosInstance.get("/renter/search-vacant-room", { params }),
  requestRoom: (data) => axiosInstance.post("/renter/request-room", data),
  checkRoomRequest: (roomId) => axiosInstance.get(`/renter/check-room-request/${roomId}`),
};

export default renterService;
