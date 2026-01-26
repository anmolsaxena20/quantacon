import React,{useContext,createContext,useState} from "react"

const ChatContext = createContext();

export const ChatStoreProvider = ({children})=>{
    const[messages,setMessages] = useState([]);
    const addMessage = (msg)=>{
        setMessages([...messages,msg]);
    }

    return <ChatContext.Provider value = {messages,addMessage}>
        {children}
    </ChatContext.Provider>

}

export default function useChatStore(){
    return useContext(ChatContext);
}