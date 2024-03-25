import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import socket from "../socket";
import axios from "axios";
import "./index.css";

export default function Sendmessage() {

    let sender = Cookies.get("select");
     sender == undefined ? sender = {sender : "" , messagefor : ""} :sender = JSON.parse(sender);
    const [message, setMessage] = useState([]);
    const [sendmessage, setSendmessage] = useState("");
    const [postImage, setPostImage] = useState();
    const [messagetype, setMessagetype] = useState("");

    async function handlesubmit() {
        try {

            setMessagetype("text");
            const response = await axios.post('http://localhost:80/message', {

                message: sendmessage,
                receiver: sender.sender,
                messagetype: messagetype,
                messagefor: sender.messagefor
            }, {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            const message = {
                type: "receiver",
                sender: sender.sender,
                message: sendmessage,
                messagetype: messagetype,
                messagefor: "individual"
            }

            let prevmessage = localStorage.getItem(message.sender);
            if (prevmessage != undefined) {
                prevmessage = JSON.parse(prevmessage);
                prevmessage.push(message);
            }

            else {
                prevmessage = [message];
            }
            localStorage.setItem(message.sender, JSON.stringify(prevmessage));
            setMessage(prevMessages => [...prevMessages, { message: sendmessage, type: "receiver", sender: "you" , messagetype : message.messagetype , messagefor : message.messagefor}]);
            setSendmessage("");
            console.log(response);
        } catch (error) {

        }
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const base64 = await convertToBase64(file);
        setPostImage({ ...postImage, myFile: base64 });
        console.log(postImage)
    };


    useEffect(() => {
        let data = localStorage.getItem(sender.sender);
        if (data != undefined) {
            data = JSON.parse(data);
            setMessage(data);
        }
        else setMessage("");
    }, [])

    useEffect(() => {
        const messageHandler = (data) => {

            const message = {
                type: "sender",
                sender: data.sender,
                message: data.message,
                name: data.name,
                messagetype : data.messagetype,
                messagefor : data.messagefor
            }
            if (data.sender === sender.sender) {

                setMessage(prevMessages => [...prevMessages, message]);
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
                message != [] ? message.map((e, index) => (
                    <div key={index} className={e.type}>
                        {e.messagefor == "group" && e.type == "sender" ? <div>{e.name}</div> : <div></div>}
                        <div>{e.message}</div>
                    </div>
                )) : <div></div>
            }

            <div>send message</div>
            <input type="text" value={sendmessage} onChange={(e) => setSendmessage(e.target.value)} />
            {/* <input type="file" name="image" id='file' accept='.jpeg , .png , .jpg' onChange={(e) => { handleFileUpload(e) }} /> */}
            <button onClick={handlesubmit}>send</button>
        </div>
    )
}
