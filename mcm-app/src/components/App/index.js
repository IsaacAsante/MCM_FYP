import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Navigation from '../Navigation';
 
const App = () => (
  <Router>
    <Navigation />
    <div>
      <h1>App</h1>
    </div>
  </Router>
);
 
export default App;