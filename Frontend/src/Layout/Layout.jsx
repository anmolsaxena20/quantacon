import React from 'react'
import {Outlet} from "react-router-dom"
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import { AuthContextProvider } from '../Context/AuthContext'

function Layout() {
  return (
    <AuthContextProvider>
    <Header/>
    <Outlet/>
    <Footer/>
    </AuthContextProvider>
  )
}

export default Layout