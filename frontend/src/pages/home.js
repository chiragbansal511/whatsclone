import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function Home() {
    const [socketid, setSocketid] = useState("");

    async function connectsocket() {
        if (socketid == "") {
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
                    console.log(data);
                })
            } catch (error) {
                console.error('Error connecting to socket:', error);
            }

        }

        else {

        }
    }

    async function setsocket() {
        try {
            const response = await axios.post('http://localhost:80/setsocketid', {
                socketid: socketid
            }, {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            console.log(response.data);
        } catch (error) {
            console.error('Error setting socket:', error);
        }
    }

    useEffect(() => {
        connectsocket();
    }, []);

    useEffect(() => {
        if (socketid) {
            setsocket();
        }
    }, [socketid]);

    return (
        <div className="App">
            home
        </div>
    );
}

export default Home;
