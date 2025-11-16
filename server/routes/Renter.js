const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getAllBills,
  getBill,
  verifyBill,
  payOnline,
  verifyPayment,
  payByCash,
  downloadInvoice,
  searchVacantRooms,
} = require("../controllers/Renter");
const {
  sendMessageToLandlord,
  getChatWithLandlord,
  sendMessageToOtherRenter,
  getChatWithOtherRenter,
} = require("../controllers/Chat");
const { auth, isRenter } = require("../middlewares/auth");

// All routes require authentication and renter role
router.use(auth, isRenter);

// Profile
router.put("/update-profile", updateProfile);

// Bills
router.get("/all-bills", getAllBills);
router.get("/bill/:billId", getBill);
router.post("/verify-bill/:billId", verifyBill);
router.post("/pay-online/:billId", payOnline);
router.post("/verify-payment", verifyPayment);
router.post("/pay-by-cash/:billId", payByCash);
router.get("/download-invoice/:billId", downloadInvoice);

// Search
router.get("/search-vacant-room", searchVacantRooms);

// Chat
router.post("/chat/:landlordId", sendMessageToLandlord);
router.get("/chat/:landlordId", getChatWithLandlord);
router.post("/chat-with-renter/:renterId", sendMessageToOtherRenter);
router.get("/chat-with-renter/:renterId", getChatWithOtherRenter);

module.exports = router;

