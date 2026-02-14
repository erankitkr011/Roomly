import axiosInstance from "../utils/axiosInstance";

const roomService = {
  postVacantRoom: (data) => axiosInstance.post("/landlord/post-vacant-room", data),
  updateVacantRoom: (roomId, data) => axiosInstance.put(`/landlord/update-vacant-room/${roomId}`, data),
  deleteVacantRoom: (roomId) => axiosInstance.delete(`/landlord/delete-vacant-room/${roomId}`),
  allocateRoom: (data) => axiosInstance.post("/landlord/allocate-room", data),
  updateAllocatedRoom: (roomId, data) => axiosInstance.put(`/landlord/update-allocated-room/${roomId}`, data),
};

export default roomService;
