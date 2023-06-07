import { combineReducers } from "@reduxjs/toolkit";
import seatsReducer from "./seatsSlice";
import selectedSeatsReducer from "./selectedSeatsSlice";

const rootReducer = combineReducers({
    seats: seatsReducer,
    selectedSeats: selectedSeatsReducer
});

export default rootReducer;

