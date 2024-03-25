import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import Sendmessage from './sendmessage';
import Addgroup from '../components/addgroup';

function Home() {
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState([]);
    const [newsender, setNewsender] = useState("");
    const [newgroup , setNewgroup] = useState("");
    const [groupcompoactive , setGroupcompoactive] = useState(false);
    const [file , setFile] = useState();

    async function connectSocket() {
        if (!socketid) {
            try {
                socket.connect();
                socket.on('connect', async () => {
                    console.log('Connected to server');
                    setSocketid(socket.id);
                    console.log(socket.id, "socket id is");
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

            let list = localStorage.getItem("sender");
            if (list != null) {
                list = list.split(",");
                setSender(list);
            }

        } catch (error) {
            console.error('Error setting socket:', error);
        }
    }


    async function getstoredofflinemessage() {
        try {
            const response = await axios.get('http://localhost:80/getmessage', {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            response.data.forEach(element => {
                const message = {
                    type: "sender",
                    sender: element.sender,
                    message: element.message,
                    name : element.name
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

                let list = localStorage.getItem("sender");
                if (list != null) {
                    list = list.split(",");
                    const res = list.find((e) => e == message.sender);
                    if (res == null) {
                        localStorage.setItem("sender", [message.sender, localStorage.getItem("sender")]);
                    }
                }

                else {
                    localStorage.setItem("sender", [message.sender]);
                }
            });

        } catch (error) {

        }
    }

    function handlesubmit() {
        let list = localStorage.getItem("sender");
        if (list != null) {
            list = list.split(",");
            localStorage.setItem("sender", [newsender, localStorage.getItem("sender")]);
            setSender(prevSender => [newsender, ...prevSender]);
        }

        else {
            localStorage.setItem("sender", [newsender]);
            setSender([newsender]);
        }
    }

    function handlegroupcomactive()
    {
        setGroupcompoactive(!groupcompoactive);
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
                type: "sender",
                sender: data.sender,
                message: data.message,
                name: data.name
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
            let list = localStorage.getItem("sender");
            if (list != null) {
                list = list.split(",");
                const res = list.find((e) => e == data.sender);
                if (res == null) {
                    localStorage.setItem("sender", [data.sender, localStorage.getItem("sender")]);
                    setSender(prevSender => [data.sender, ...prevSender]);
                }
            }

            else {
                localStorage.setItem("sender", [data.sender]);
                setSender([data.sender]);
            }
        };

        socket.on("message", handleMessage);

        return () => {
            socket.off("message", handleMessage);
        };
    }, []);

    useEffect(() => {
        getstoredofflinemessage();
    }, [])

    return (
        <div className="App">
           <div className='App1'>
           {
                !groupcompoactive ? <div className=''>
                <input type="text" value={newsender} onChange={(e) => setNewsender(e.target.value)} />
                <button onClick={handlesubmit}>Add user</button>
                <button onClick={handlegroupcomactive}>New group</button>
                {
                    sender.map((senderName, index) => (
                        <div key={index}>
                            {senderName != "" ? <button onClick={() => { Cookies.set("select", senderName); window.location.reload() }}>{senderName}</button>
                                : <div></div>}
                        </div>
                    ))
                }
            </div> : <div><Addgroup  handlegroupcomactive={handlegroupcomactive}/></div>
            }

           </div>

            <div className='App2'> <Sendmessage /></div>
        </div>
    );
}

export default Home;