import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import Footer from './components/Footer/Footer'

function RootLayout() {
  return (
    <div>
        <NavBar/>
        <div className="" style={{minHeight:"80vh"}}>
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default RootLayout