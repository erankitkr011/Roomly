import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  userRoles: null,
  loading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDashboardStats: (state, action) => {
      state.stats = action.payload.stats;
      state.userRoles = action.payload.userRoles;
    },
    clearDashboard: (state) => {
      state.stats = null;
      state.userRoles = null;
    },
  },
});

export const { setDashboardLoading, setDashboardStats, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
