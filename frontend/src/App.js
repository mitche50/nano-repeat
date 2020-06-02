import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'

import Routes from './components/navigation/Routes'

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className="flex flex-col">
          <Routes />
        </div>
      </Router>
    );
  }  
}

