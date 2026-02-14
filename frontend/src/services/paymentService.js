import axiosInstance from "../utils/axiosInstance";

const paymentService = {
  payOnline: (billId) => axiosInstance.post(`/renter/pay-online/${billId}`),
  verifyPayment: (data) => axiosInstance.post("/renter/verify-payment", data),
  payByCash: (billId) => axiosInstance.post(`/renter/pay-by-cash/${billId}`),
  downloadInvoice: (billId) => axiosInstance.get(`/renter/download-invoice/${billId}`),
};

export default paymentService;
