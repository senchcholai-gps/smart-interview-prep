import React from 'react';
import HeroSection from './components/HeroSection';
import './App.css';

function App() {
  return (
    <div className="App">
      <HeroSection />
    </div>
  );
}

export default App;
import React from 'react';
import Navbar from './components/Navbar';  // ADD THIS LINE
import HeroSection from './components/HeroSection';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />  {/* ADD THIS LINE */}
      <HeroSection />
    </div>
  );
}

export default App;