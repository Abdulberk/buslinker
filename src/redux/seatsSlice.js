import {createSlice} from '@reduxjs/toolkit';

const seatsSlice = createSlice({
    name: 'seats',
    initialState: [],
    reducers: {

        setSeats: (state, action) => {
            return action.payload;
        },

        selectSeat: (state, action) => {

            const seatNumber = action.payload;
            const seatIndex = state.findIndex(seat => seat.seatNumber === seatNumber);

            if (seatIndex !== -1) {
                state[seatIndex].selected = !state[seatIndex].selected;
            }
        },

        reserveSeat: (state, action) => {
            const seatNumber = action.payload;
            const seatIndex = state.findIndex(seat => seat.seatNumber === seatNumber);

            if (seatIndex !== -1) {
                state[seatIndex].reserved = true;
            }


        },
        

    }
});

export const {setSeats, selectSeat, reserveSeat} = seatsSlice.actions;
export default seatsSlice.reducer;
