import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState([]);
    const [socketcopy , setSocketcopy] = useState(null);

    async function connectSocket() {
        if (!socketid) {
            try {
                const socket = await io('http://localhost:80', {
                    transports: ['websocket'],
                });
            
                socket.on('connect', () => {
                    console.log('Connected to server');
                    setSocketid(socket.id);
                    console.log('Socket ID:', socket.id);
                    console.log(socket)
                    // after time
                });

                socket.on("message", (data) => {
                    const message = {
                        type : "sender",
                        sender : data.sender,
                        message : data.message,
                    }
                    console.log(message) // delete after use 
                    let prevmessage = Cookies.get(message.sender);
                    if(prevmessage != null)
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
                            setSender(prevSender => [data.sender , ...prevSender]);
                        }
                    }

                    else {
                        Cookies.set("sender" , [data.sender]);
                        setSender([data.sender]);
                    }

                });
            } catch (error) {
                console.error('Error connecting to socket:', error);
            }
            
        }
        
    }

    async function setSocketinbackend() {
        try {
            const response = await axios.post('http://localhost:80/setsocketid', {
                socketid: socketid
            }, {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            let list = Cookies.get("sender");
            if (list != null) {
                list = list.split(",");
                setSender(list);
            }

        } catch (error) {
            console.error('Error setting socket:', error);
        }
    }

    useEffect(() => {
        connectSocket();
    }, []);

    useEffect(() => {
        if (socketid) {
            setSocketinbackend();
        }
    }, [socketid]);


    return (
        <div className="App">
            {
                sender.map((senderName, index) => (
                    <div key={index}>
                       {senderName != "" ? <button onClick={()=>{ navigate("/sendmessage" , {state : {data : senderName , socket : socketcopy}});}}>{senderName}</button> : <div></div>}
                    </div>
                ))
            }
        </div>
    );
}

export default Home;
