import { combineReducers } from "@reduxjs/toolkit";
import seatsReducer from "./seatsSlice";
import selectedSeatsReducer from "./selectedSeatsSlice";
import filtersReducer from "./filtersSlice";


const rootReducer = combineReducers({
    seats: seatsReducer,
    selectedSeats: selectedSeatsReducer,
    filters: filtersReducer
});

export default rootReducer;


