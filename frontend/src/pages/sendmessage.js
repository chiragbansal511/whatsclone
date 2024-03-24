import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import socket from "../socket";

export default function Sendmessage() {
    const location = useLocation();
    const sender = location.state.data;
    const [message, setMessage] = useState([]);

    useEffect(() => {
        let data = Cookies.get(sender);
        if(data != undefined)
        {   data = JSON.parse(data);
            let datamessage = [];
            data.forEach(element => {
                datamessage.push(element.message);
            });
            setMessage(datamessage);
        }
        else setMessage("");
    }, [])

    useEffect(() => {
        const messageHandler = (data) => {

            const message = {
                type : "sender",
                sender : data.sender,
                message : data.message,
            }

            let prevmessage = Cookies.get(message.sender);
            if(prevmessage != undefined)
            {
                prevmessage = JSON.parse(prevmessage);
                prevmessage.push(message);
            }

            else {
                prevmessage = [message];
            }
            Cookies.set(message.sender , JSON.stringify(prevmessage));

            let list = Cookies.get("sender");
            if (list != null) {
                list = list.split(",");
                const res = list.find((e) => e == data.sender);
                if (res == null) {
                    Cookies.set("sender", [data.sender, Cookies.get("sender")]);
                }
            }

            else {
                Cookies.set("sender" , [data.sender]);
            }


            if (data.sender === sender) {

                setMessage(prevMessages => [...prevMessages, data.message]);
            }
        };

        socket.on("message", messageHandler);

        return () => {
            socket.off("message", messageHandler);
        };
    }, [sender])


    return (
        <div>
            {
                message.map((e , index)=>(
                    <div key={index} >
                        {e}
                    </div>
                ))
            }
        </div>
    )
}
