import axiosInstance from "../utils/axiosInstance";

const chatService = {
  // Get all my chats (works for both landlord and renter)
  getMyChats: async () => {
    try {
      return await axiosInstance.get("/landlord/my-chats");
    } catch {
      return await axiosInstance.get("/renter/my-chats");
    }
  },

  // Landlord side
  getChatWithRenter: (renterId) => axiosInstance.get(`/landlord/chat/${renterId}`),
  sendMessageToRenter: (renterId, content) => axiosInstance.post(`/landlord/chat/${renterId}`, { content }),

  // Renter side
  getChatWithLandlord: (landlordId) => axiosInstance.get(`/renter/chat/${landlordId}`),
  sendMessageToLandlord: (landlordId, content) => axiosInstance.post(`/renter/chat/${landlordId}`, { content }),
};

export default chatService;
