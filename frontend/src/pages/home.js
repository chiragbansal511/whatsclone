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
    const [groupcompoactive , setGroupcompoactive] = useState(false);
    const [newgroup , setNewgroup] = useState("");
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
                list = JSON.parse(list);
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
                    name : element.name,
                    messagetype : element.messagetype,
                    messagefor : element.messagefor
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
                    list = JSON.parse(list);
                    const res = list.find((e) => e.sender == message.sender);
                    if (res == null) {
                        list.push({sender : message.sender , messagefor : message.messagefor});     
                    }
                }

                else {
                    list = [{sender : message.sender , messagefor : message.messagefor}];
                }

                localStorage.setItem("sender", JSON.stringify(list));
            });

        } catch (error) {

        }
    }

    function handlesubmit() {
        let list = localStorage.getItem("sender");
        if (list != null) {
            list = JSON.parse(list);
            list.push({sender : newsender , messagetype : "individual"})
            setSender(prevSender => [{sender : newsender , messagetype : "individual"}, ...prevSender]);
        }

        else {
           list = [{sender : newsender , messagetype : "individual"}];
           setSender([{sender : newsender , messagetype : "individual"}]);
        }

        localStorage.setItem("sender", JSON.stringify(list));
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
                name: data.name,
                messagetype : data.messagetype,
                messagefor : data.messagefor
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
                list = JSON.parse(list);
                const res = list.find((e) => e.sender == data.sender);
                if (res == null) { 
                    list.push({sender : message.sender , messagefor : message.messagefor});
                    setSender(prevSender => [{sender : message.sender , messagefor : message.messagefor}, ...prevSender]);
                }
            }

            else {
                list = [{sender : message.sender , messagefor : message.messagefor}];
                setSender([{sender : message.sender , messagefor : message.messagefor}]);
            }
            localStorage.setItem("sender", JSON.stringify(list));
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
                            {senderName.sender != "" ? <button onClick={() => { Cookies.set("select", JSON.stringify(senderName)); window.location.reload() }}>{senderName.sender}</button>
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