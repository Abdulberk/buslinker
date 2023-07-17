import React from 'react';
import {useEffect, useState} from 'react';
import Navbar from '../components/navbar';
import ResultBooking from '../components/result-booking';
import Filters from '../components/filters/Filters';
import Footer from '../components/footer';
import Travels from '../components/travels/Travels';
import styled from 'styled-components';





const ContentContainer = styled.div`

  display: flex;
  justify-content:center;
  align-items: flex-start;
  padding: 20px;
   gap: 65px;
   margin-top: 20px;
   
 


`;

const Results = () => {

    return (
      <>
    
      <Navbar />
      <ResultBooking />
      <ContentContainer>
        <Filters />
        <Travels />
      </ContentContainer>
      <Footer />
      </>

    ) 
}

export default Results;