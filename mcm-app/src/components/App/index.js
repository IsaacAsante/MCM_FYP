import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Navigation from "../Navigation";
import Sidebar from "../Sidebar";

// CSS
import "../../template/lib/bootstrap/css/bootstrap.min.css";
import "../../template/lib/font-awesome/css/font-awesome.css";
import "../../template/css/style.css";
import "../../template/css/style-responsive.css";

const App = () => (
  <Router>
    <Navigation />
    <Sidebar />
  </Router>
);

export default App;
