import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from 'react-router-dom';
import socket from '../socket';

function Home() {
    const navigate = useNavigate();
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState([]);

    async function connectSocket() {
        if (!socketid) {
            try {
                socket.connect();
                socket.on('connect', async () => {
                    console.log('Connected to server');
                    setSocketid(socket.id);
                    console.log(socket.id , "socket id is");
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


    async function getstoredofflinemessage()
    {
        try {
            const response = await axios.get('http://localhost:80/getmessage',  {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            response.data.forEach(element => {
                const message = {
                    type : "sender",
                    sender : element.sender,
                    message : element.message,
                }
                console.log(message) // delete after use 
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
                    const res = list.find((e) => e == message.sender);
                    if (res == null) {
                        Cookies.set("sender", [message.sender, Cookies.get("sender")]);
                    }
                }
    
                else {
                    Cookies.set("sender" , [message.sender]);
                }
            });

        } catch (error) {
            
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


    useEffect(() => {
        const handleMessage = (data) => {
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
                    setSender(prevSender => [data.sender , ...prevSender]);
                }
            }

            else {
                Cookies.set("sender" , [data.sender]);
                setSender([data.sender]);
            }
        };

        socket.on("message", handleMessage);

        return () => {
            socket.off("message", handleMessage);
        };
    }, []);
    
    useEffect( () =>{
      getstoredofflinemessage();
    }, [])
    
    return (
        <div className="App">
            {
                sender.map((senderName, index) => (
                    <div key={index}>
                       {senderName != "" ? <button onClick={()=>{ navigate("/sendmessage" , {state : {data : senderName }});}}>{senderName}</button> : <div></div>}
                    </div>
                ))
            }
        </div>
    );
}

export default Home;
