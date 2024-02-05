import { createContext, useContext, useEffect, useState } from 'react'
// import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const chatContext = createContext()

const ChatProvider = ({children }) => {
    const [user, setUser] = useState()
    const [selectedChat,setSelectedChat]=useState()
    const [chats,setChats]=useState([])
    const [notification, setNotification]=useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"))
        setUser(userInfo)
        if (!userInfo) {
            navigate("/")
            // return <Link to="/" />;
        }
    },[navigate])

    return (
        <chatContext.Provider value={{ 
            user, setUser, selectedChat, setSelectedChat, 
            notification,setNotification,
            chats, setChats }}>
            {children}
        </chatContext.Provider>
    )
}

export const ChatState = () => {
    return useContext(chatContext);
};
export default ChatProvider;

