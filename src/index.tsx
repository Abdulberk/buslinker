import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Results from './pages/Results';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(


  <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path = "/results" element = {<Results />} /> 
      </Routes>
    </Router>

   
  </Provider>

);

