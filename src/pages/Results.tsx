import React from 'react';
import {useEffect, useState} from 'react';
import Navbar from '../components/navbar';
import ResultBooking from '../components/result-booking';
import Filters from '../components/filters/Filters';
const Results = () => {

    return (
       <>
         <Navbar />
            <ResultBooking />
            <Filters />
       </>

    ) 
}

export default Results;