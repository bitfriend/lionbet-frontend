import React, { FunctionComponent, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';

import Home from './scenes/Home';
import Admin from './scenes/Admin';

import { provider, requestAccount } from './helpers';

import DAI from './contracts/DAI.json';
import Bet from './contracts/Bet.json';
import BetOracle from './contracts/BetOracle.json';
import DefiPool from './contracts/DefiPool.json';

const App: FunctionComponent = () => {
  console.log('REACT_APP_CHAIN_ID', process.env.REACT_APP_CHAIN_ID);

  useEffect(() => {
    requestAccount();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
