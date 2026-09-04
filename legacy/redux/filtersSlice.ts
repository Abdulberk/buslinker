import {createSlice, PayloadAction} from '@reduxjs/toolkit';



export interface FiltersState {
    priceRange: [number, number]
    departureTimeRange: [number, number],
    seatLayout: string,
    busCompanies: string[],
    services: string[],
    destination: string[],
    departure: string[],
}

 
  const initialState:FiltersState = {
 
      priceRange: [0, 1000],
      departureTimeRange: [0, 24],
      seatLayout: '',
      busCompanies: [],
      services: [],
      destination: [],
      departure: [],
  
  };

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<FiltersState>) {
            state = action.payload;
        },
        setPriceRange(state, action:PayloadAction<[number, number]>
            ) {
            state.priceRange = action.payload
        },
        setDepartureTimeRange(state, action:PayloadAction<[number, number]>) {
            state.departureTimeRange = action.payload
        },
        setSeatLayout(state, action:PayloadAction<string>) {
            state.seatLayout = action.payload
        },
        setBusCompanies(state, action:PayloadAction<string[]>) {
            state.busCompanies = action.payload
        },
        setServices(state, action :PayloadAction<string[]>) {
            state.services = action.payload
        },
        setDestination(state, action :PayloadAction<string[]>) {
            state.destination = action.payload
        },
        setDeparture(state, action :PayloadAction<string[]>) {
            state.departure = action.payload
        },

        clearFilters: (state) => {
            state = {
              priceRange: [0, 1000],
              departureTimeRange: [0, 24],
              seatLayout: '',
              busCompanies: [],
              services: [],
              destination: [],
              departure: [],
            };
          },
          

    }

})


export const {setFilters, setPriceRange, setDepartureTimeRange, setSeatLayout, setBusCompanies, setServices, setDestination, setDeparture, clearFilters} = filtersSlice.actions;

export default filtersSlice.reducer;

