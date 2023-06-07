import { createSlice } from "@reduxjs/toolkit";

const selectedSeatsSlice = createSlice({
    name: "selectedSeats",
    initialState: [
      
    ],
    reducers: {

        addSeat : (state, action) => {
            const {seatNumber,gender} = action.payload;
            state.push({
                seatNumber,
                gender
            });

        },

        removeSeat: (state, action) => {
            const seatNumber = action.payload;
            const seatIndex = state.findIndex((seat) => seat.seatNumber === seatNumber);
          
            if (seatIndex !== -1) {
              state.splice(seatIndex, 1);
            }
          },

        clearSeats : (state) => {
            state = [];

        },

        updateGender : (state, action) => {

            const {seatNumber, gender} = action.payload;
            const seat = state.find(seat => seat.seatNumber === seatNumber);
            if (seat) {
                seat.gender = gender;

            }
            



        }

    }

});

export const { addSeat, removeSeat, clearSeats, updateGender } = selectedSeatsSlice.actions;
export default selectedSeatsSlice.reducer;

