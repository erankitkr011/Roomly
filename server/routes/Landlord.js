const express = require("express");
const router = express.Router();
const {
  // House management
  createHouse,
  getAllHouses,
  getHouseOverview,
  updateHouse,
  deleteHouse,
  addFloor,
  getHouseFloors,
  updateFloor,
  deleteFloor,
  getFloorWithUnits,
  getHouseRooms,
  getFloorRooms,
  // Renter management
  addRenter,
  updateRenter,
  allocateRoom,
  updateAllocatedRoom,
  sendBill,
  updateBill,
  requestDeleteBill,
  sendNotification,
  getAllRenters,
  getRenterBills,
  payCashBill,
  postVacantRoom,
  updateVacantRoom,
  deleteVacantRoom,
  deleteRenter,
} = require("../controllers/Landlord");
const {
  sendMessageToRenter,
  getChatWithRenter,
  enableRenterChat,
  disableRenterChat,
} = require("../controllers/Chat");
const { auth, isLandlord } = require("../middlewares/auth");

// All routes require authentication and landlord role
router.use(auth, isLandlord);

// House management
router.post("/house", createHouse);
router.get("/houses", getAllHouses);
router.get("/house/:houseId/overview", getHouseOverview);
router.put("/house/:houseId", updateHouse);
router.delete("/house/:houseId", deleteHouse);

// Floor management
router.post("/house/:houseId/floor", addFloor);
router.get("/house/:houseId/floors", getHouseFloors);
router.put("/floor/:floorId", updateFloor);
router.delete("/floor/:floorId", deleteFloor);
router.get("/floor/:floorId/units", getFloorWithUnits);

// Room management
router.get("/house/:houseId/rooms", getHouseRooms);
router.get("/floor/:floorId/rooms", getFloorRooms);
router.post("/allocate-room", allocateRoom);
router.put("/update-allocated-room/:roomId", updateAllocatedRoom);
router.post("/post-vacant-room", postVacantRoom);
router.put("/update-vacant-room/:roomId", updateVacantRoom);
router.delete("/delete-vacant-room/:roomId", deleteVacantRoom);

// Renter management
router.post("/add-renter", addRenter);
router.put("/update-renter/:renterId", updateRenter);
router.delete("/delete-renter/:renterId", deleteRenter);
router.get("/all-renters", getAllRenters);

// Bill management
router.post("/send-bill", sendBill);
router.put("/update-bill/:billId", updateBill);
router.post("/request-delete-bill/:billId", requestDeleteBill);
router.get("/renter-bills/:renterId", getRenterBills);
router.post("/pay-cash-bill/:billId", payCashBill);

// Notifications
router.post("/send-notification", sendNotification);

// Chat
router.post("/chat/:renterId", sendMessageToRenter);
router.get("/chat/:renterId", getChatWithRenter);
router.post("/enable-renter-chat", enableRenterChat);
router.post("/disable-renter-chat", disableRenterChat);

module.exports = router;

