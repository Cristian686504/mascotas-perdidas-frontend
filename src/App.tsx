import React from "react";
import Header from "./components/header/Header";
import Map from "./components/map/Map";

function App() {
  return (
    <div>
      <Header />
      <main className='main-content'>
        <Map />
      </main>
    </div>
  );
}

export default App;
