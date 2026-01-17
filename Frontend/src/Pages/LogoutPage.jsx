import React from 'react'
import useAuth from '../Context/AuthContext'
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router';
async function logout() {
const{user,isLogin,setIsLogin,setUser} = useAuth();
const Navigate = useNavigate();
    try {
        const token = localStorage.getItem("token");
        if(!token){
            toast("invalid user");
            Navigate("/");
        }
        const res = await fetch("http://localhost:5000/auth/logout",
            {
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            }
        )
        if(!res.ok) throw new Error(`Error:${res.status}`);
        setUser(null);
        setIsLogin(false);
        localStorage.removeItem("token");
        toast.success("logout successful");

    } catch (error) {
        
    }
    return <div><Toaster/></div>
}

export default logout