import { useLocation } from "react-router-dom"
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import socket from "../socket";


export default function Sendmessage() {
    const location = useLocation();
    const sender = location.state.data;
    const [message, setMessage] = useState([]);

    socket.on("message", (data) => {
        console.log(data);
        if(data.sender == sender)
        {
            const mess = message;
            mess.push(data.message);
            setMessage(mess);
            console.log(mess)
        }
    })

    useEffect(() => {
        const mess = Cookies.get(sender);
        setMessage(JSON.parse(mess));
    }, [])

    // useEffect(() => {

       

    // }, [])

    return (
        <div>
            {JSON.stringify(message)}
        </div>
    )
}