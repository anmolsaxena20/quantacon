import React,{createContext,useState,useContext,useEffect} from 'react'

const AuthContext = createContext();

export const  AuthContextProvider = ({children}) =>{
    const[isLogin,setIsLogin] = useState(false);
    const [user,setUser] = useState(null);
  return (
    <AuthContext.Provider value={{isLogin,setIsLogin,user,setUser}}>
        {children}
    </AuthContext.Provider>
  )
}

export default function useAuth(){
    return useContext(AuthContext);
}
