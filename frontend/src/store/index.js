import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import dashboardReducer from "../slices/dashboardSlice";
import houseReducer from "../slices/houseSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    house: houseReducer,
  },
});

export default store;
