import axiosInstance from "../utils/axiosInstance";

const houseService = {
  // House CRUD
  createHouse: (data) => axiosInstance.post("/landlord/house", data),
  getAllHouses: () => axiosInstance.get("/landlord/houses"),
  getHouseOverview: (houseId) => axiosInstance.get(`/landlord/house/${houseId}/overview`),
  updateHouse: (houseId, data) => axiosInstance.put(`/landlord/house/${houseId}`, data),
  deleteHouse: (houseId) => axiosInstance.delete(`/landlord/house/${houseId}`),

  // Floor CRUD
  addFloor: (houseId, data) => axiosInstance.post(`/landlord/house/${houseId}/floor`, data),
  getHouseFloors: (houseId) => axiosInstance.get(`/landlord/house/${houseId}/floors`),
  updateFloor: (floorId, data) => axiosInstance.put(`/landlord/floor/${floorId}`, data),
  deleteFloor: (floorId) => axiosInstance.delete(`/landlord/floor/${floorId}`),
  getFloorWithUnits: (floorId) => axiosInstance.get(`/landlord/floor/${floorId}/units`),

  // Rooms
  getHouseRooms: (houseId) => axiosInstance.get(`/landlord/house/${houseId}/rooms`),
  getFloorRooms: (floorId) => axiosInstance.get(`/landlord/floor/${floorId}/rooms`),
};

export default houseService;
