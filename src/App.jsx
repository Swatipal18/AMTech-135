import React from 'react'
import Navbar from './Router/navbar'
import "./index.css"
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import NotificationHandler from './NotificationHandler';


function App() {

  return (
    <>
      <NotificationHandler />
      <Navbar />
    </>
  )
}

export default App
