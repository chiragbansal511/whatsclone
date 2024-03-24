import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";
import "./index.css";

export default function Sendmessage() {
    const location = useLocation();
    const sender = location.state.data;
    const [message, setMessage] = useState([]);
    const [sendmessage, setSendmessage] = useState("");

    async function handlesubmit() {
        try {
            const response = await axios.post('http://localhost:80/message', {

                message: sendmessage,
                receiver: sender
            }, {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            const message = {
                type: "receiver",
                sender: sender,
                message: sendmessage,
            }

            let prevmessage = Cookies.get(message.sender);
            if (prevmessage != undefined) {
                prevmessage = JSON.parse(prevmessage);
                prevmessage.push(message);
            }

            else {
                prevmessage = [message];
            }
            Cookies.set(message.sender, JSON.stringify(prevmessage));
            setMessage(prevMessages => [...prevMessages, { message: sendmessage, type: "receiver" }]);
            setSendmessage("");
            console.log(response);
        } catch (error) {

        }
    }

    useEffect(() => {
        let data = Cookies.get(sender);
        if (data != undefined) {
            data = JSON.parse(data);
            let datamessage = [];
            data.forEach(element => {
                datamessage.push({ message: element.message, type: element.type });
            });
            setMessage(datamessage);
        }
        else setMessage("");
    }, [])

    useEffect(() => {
        const messageHandler = (data) => {

            const message = {
                type: "sender",
                sender: data.sender,
                message: data.message,
            }

            let prevmessage = Cookies.get(message.sender);
            if (prevmessage != undefined) {
                prevmessage = JSON.parse(prevmessage);
                prevmessage.push(message);
            }

            else {
                prevmessage = [message];
            }
            Cookies.set(message.sender, JSON.stringify(prevmessage));

            let list = Cookies.get("sender");
            if (list != null) {
                list = list.split(",");
                const res = list.find((e) => e == data.sender);
                if (res == null) {
                    Cookies.set("sender", [data.sender, Cookies.get("sender")]);
                }
            }

            else {
                Cookies.set("sender", [data.sender]);
            }


            if (data.sender === sender) {

                setMessage(prevMessages => [...prevMessages, { message: data.message, type: "sender" }]);
            }
        };

        socket.on("message", messageHandler);

        return () => {
            socket.off("message", messageHandler);
        };
    }, [sender])


    return (
        <div className="container">
            {
                message.map((e, index) => (
                    <div key={index} className={e.type}>
                        <div>{e.message}</div>
                    </div>
                ))
            }

            <div>send message</div>
            <input type="text" value={sendmessage} onChange={(e) => setSendmessage(e.target.value)} />
            <button onClick={handlesubmit}>send</button>
        </div>
    )
}
