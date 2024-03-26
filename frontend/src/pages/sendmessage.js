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
    const [uploadcompo , setUploadcompo] = useState(false);

    async function handlesubmit() {
        try {

            const response = await axios.post('http://localhost:80/message', {

                message: sendmessage,
                receiver: sender.sender,
                messagetype: "text",
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
                messagetype: "text",
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
            setMessage(prevMessages => [...prevMessages, { message: sendmessage, type: "receiver", sender: "you" , messagetype : "text" , messagefor : message.messagefor}]);
            setSendmessage("");
            console.log(response);
        } catch (error) {

        }
    }

    async function handleimagesend()
    {   
        try {

            const response = await axios.post('http://localhost:80/message', {

                message: postImage,
                receiver: sender.sender,
                messagetype: "image",
                messagefor: sender.messagefor
            }, {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            const message = {
                type: "receiver",
                sender: sender.sender,
                message: postImage,
                messagetype: "image",
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
            setMessage(prevMessages => [...prevMessages, { message: postImage, type: "receiver", sender: "you" , messagetype : "image" , messagefor : message.messagefor}]);
            setPostImage("");
           
        } catch (error) {
            
        }

        setUploadcompo(false);
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
        setPostImage({myFile: base64 });
        console.log(postImage , "postimage");
        console.log(base64);
        setUploadcompo(true);
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
                        {
                            e.messagetype == "text" ? <div>{e.message}</div> : <img src={e.message.myFile} alt="image" height="100vh" width="100vh" />
                        }
                    </div>
                )) : <div></div>
            }

            <div>send message</div>
            <input type="text" value={sendmessage} onChange={(e) => setSendmessage(e.target.value)} />
            
            {
                uploadcompo ? <div>
                    <img src={postImage.myFile} alt="image" height="100vh" width="100vh" />
                    <button onClick={handleimagesend}>Send</button>
                </div>
                :
                <div></div>
            }

            <input type="file" name="image" id='file' accept='.jpeg , .png , .jpg' onChange={(e) => { handleFileUpload(e) }} />
            <button onClick={handlesubmit}>send</button>
        </div>
    )
}
