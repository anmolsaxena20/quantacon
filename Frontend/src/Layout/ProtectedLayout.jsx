import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Header from '../Components/Header'
import Footer from '../Components/Footer'
import useAuth, { AuthContextProvider } from '../Context/AuthContext'

function ProtectedLayout() {
    const {user} = useAuth();
    if(!user) return <Navigate to="/login" replace/>;
  return( 
  <AuthContextProvider>
    <Header/>
    <Outlet/>
    <Footer/>
  </AuthContextProvider>
  )
}

export default ProtectedLayout