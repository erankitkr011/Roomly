import axiosInstance from "../utils/axiosInstance";

const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosInstance.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default uploadService;
