import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function Home() {
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState(["you"]);

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
                  
                    console.log(sender, 'res'); // Log the actual value of res
                   
                        setSender(prevSender => [...prevSender, data.sender]); // Add sender to the list
                   
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

            console.log(response.data);
            // Load sender list from cookies after setting socket
            const savedSender = Cookies.get("sender");
            if (savedSender) {
                setSender(JSON.parse(savedSender));
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

    useEffect(() => {
        // Save sender list to cookies whenever it changes
        Cookies.set("sender", sender);
    }, [sender]);

    return (
        <div className="App">
            {
                sender.map((senderName, index) => (
                    <div key={index}>
                         {senderName}
                    </div>
                ))
            }
        </div>
    );
}

export default Home;
