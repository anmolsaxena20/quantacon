import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route } from 'react-router-dom'
import Layout from './Layout/Layout'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import About from './Pages/About'
import Contact from './Pages/Contact'
import HomePage from './Pages/HomePage'
import ProtectedLayout from './Layout/ProtectedLayout'
import ProfilePage from './Pages/ProfilePage'
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<Layout />}>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='' element={<HomePage />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path='/profile' element={<ProfilePage />} />
      </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)
