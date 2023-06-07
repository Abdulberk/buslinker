import React from 'react';
import Navbar from './components/navbar';
import Booking from './components/booking';
import Partners from './components/partner-companies';
import PopularDestinations from './components/destinations';
import WhyBuslinker from './components/why-buslinker';
import PopularTerminals from './components/popular-terminals';
import Footer from './components/footer';
import Bus from './components/bus';




function App() {
  return (
    <div>

      <Navbar />
      <Bus />
      <Booking />
      <Partners />
      <PopularDestinations />
      <WhyBuslinker />
      <PopularTerminals />
      <Footer />
      
    </div>
  );
}

export default App;
