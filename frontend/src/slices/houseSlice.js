import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  houses: [],
  currentHouse: null,
  floors: [],
  currentFloor: null,
  rooms: [],
  loading: false,
};

const houseSlice = createSlice({
  name: "house",
  initialState,
  reducers: {
    setHouseLoading: (state, action) => {
      state.loading = action.payload;
    },
    setHouses: (state, action) => {
      state.houses = action.payload;
    },
    setCurrentHouse: (state, action) => {
      state.currentHouse = action.payload;
    },
    setFloors: (state, action) => {
      state.floors = action.payload;
    },
    setCurrentFloor: (state, action) => {
      state.currentFloor = action.payload;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    clearHouseState: (state) => {
      state.currentHouse = null;
      state.floors = [];
      state.currentFloor = null;
      state.rooms = [];
    },
  },
});

export const {
  setHouseLoading,
  setHouses,
  setCurrentHouse,
  setFloors,
  setCurrentFloor,
  setRooms,
  clearHouseState,
} = houseSlice.actions;
export default houseSlice.reducer;
