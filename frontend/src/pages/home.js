import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function Home() {
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState([]);

    async function connectSocket() {
        if (!socketid) { // Check if socket is not already connected
            try {
                const socket = await io('http://localhost:80', {
                    transports: ['websocket'],
                });

                socket.on('connect', () => {
                    console.log('Connected to server');
                    setSocketid(socket.id);
                    console.log('Socket ID:', socket.id);
                });

                socket.on("message", (data) => {

                    let list = Cookies.get("sender");
                    if (list != null) {
                        list = list.split(",");
                        const res = list.find((e) => e == data.sender);
                        if (res == null) {
                            Cookies.set("sender", [data.sender, Cookies.get("sender")]);
                            setSender(prevSender => [data.sender , ...prevSender]);
                            console.log("hello")
                        }
                    }

                    else {
                        Cookies.set("sender" , [data.sender]);
                        setSender([data.sender]);
                    }

                    console.log(list, "gbvbdcvbwef");
                });

            } catch (error) {
                console.error('Error connecting to socket:', error);
            }
        }
    }

    async function setSocket() {
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
            setSocket();
        }
    }, [socketid]);


    return (
        <div className="App">
            {
                sender.map((senderName, index) => (
                    <div key={index}>
                        <button>{senderName}   </button>
                    </div>
                ))
            }
        </div>
    );
}

export default Home;
