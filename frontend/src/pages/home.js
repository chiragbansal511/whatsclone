import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import socket from '../socket';
import Sendmessage from './sendmessage';
import Addgroup from '../components/addgroup';
import Status from '../components/status';

function Home() {
    const [socketid, setSocketid] = useState("");
    const [sender, setSender] = useState([]);
    const [newsender, setNewsender] = useState("");
    const [groupcompoactive, setGroupcompoactive] = useState(false);
    const [select, setSelect] = useState(["send", "hidden", "send", "hidden"]);

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

            response.data.forEach(async (element) => {
                const message = {
                    type: "sender",
                    sender: element.sender,
                    message: element.message,
                    name: element.name,
                    messagetype: element.messagetype,
                    messagefor: element.messagefor
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

                        const response = await axios.post('http://localhost:80/profilephoto',

                            {
                                email: message.sender,
                                messagefor: message.messagefor
                            },

                            {
                                headers: {
                                    Authorization: "Bearer " + Cookies.get("accessToken")
                                }
                            });


                        list.push({ sender: message.sender, messagefor: message.messagefor, profilephoto: response.data.profilephoto });
                    }
                }

                else {

                    const response = await axios.post('http://localhost:80/profilephoto',

                        {
                            email: message.sender,
                            messagefor: message.messagefor
                        },

                        {
                            headers: {
                                Authorization: "Bearer " + Cookies.get("accessToken")
                            }
                        });

                    list = [{ sender: message.sender, messagefor: message.messagefor, profilephoto: response.data.profilephoto }];
                }

                localStorage.setItem("sender", JSON.stringify(list));
            });

        } catch (error) {

        }
    }

    async function handlesubmit() {
        let list = localStorage.getItem("sender");
        if (list != null) {

            const response = await axios.post('http://localhost:80/profilephoto',

                {
                    email: newsender,
                    messagefor: "individual"
                },

                {
                    headers: {
                        Authorization: "Bearer " + Cookies.get("accessToken")
                    }
                });

            list = JSON.parse(list);
            list.push({ sender: newsender, messagefor: "individual", profilephoto: response.data.profilephoto })
            setSender(prevSender => [{ sender: newsender, messagefor: "individual", profilephoto: response.data.profilephoto }, ...prevSender]);
        }

        else {

            const response = await axios.post('http://localhost:80/profilephoto',

                {
                    email: newsender,
                    messagefor: "individual"
                },

                {
                    headers: {
                        Authorization: "Bearer " + Cookies.get("accessToken")
                    }
                });

            list = [{ sender: newsender, messagefor: "individual", profilephoto: response.data.profilephoto }];
            setSender([{ sender: newsender, messagefor: "individual", profilephoto: response.data.profilephoto }]);
        }

        localStorage.setItem("sender", JSON.stringify(list));
    }

    function handlegroupcomactive() {
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
        const fetchDataAndHandleMessage = async (data) => {
            const message = {
                type: "sender",
                sender: data.sender,
                message: data.message,
                name: data.name,
                messagetype: data.messagetype,
                messagefor: data.messagefor
            };

            let prevmessage = localStorage.getItem(message.sender);
            if (prevmessage != undefined) {
                prevmessage = JSON.parse(prevmessage);
                prevmessage.push(message);
            } else {
                prevmessage = [message];
            }
            localStorage.setItem(message.sender, JSON.stringify(prevmessage));

            let list = JSON.parse(localStorage.getItem("sender")) || [];
            const senderExists = list.find((e) => e.sender === data.sender);
            if (!senderExists) {
                try {

                    const response = await axios.post('http://localhost:80/profilephoto',

                        {
                            email: message.sender,
                            messagefor: message.messagefor
                        },

                        {
                            headers: {
                                Authorization: "Bearer " + Cookies.get("accessToken")
                            }
                        });

                    console.log(response);

                    list.push({ sender: message.sender, messagefor: message.messagefor, profilephoto: response.data.profilephoto });
                    setSender(prevSender => [{ sender: message.sender, messagefor: message.messagefor, profilephoto: response.data.profilephoto }, ...prevSender]);
                } catch (error) {
                    console.error('Error fetching profile photo:', error);
                }
            }
            localStorage.setItem("sender", JSON.stringify(list));
        };

        socket.on("message", fetchDataAndHandleMessage);

        return () => {
            socket.off("message", fetchDataAndHandleMessage);
        };
    }, []);


    useEffect(() => {
        getstoredofflinemessage();
    }, [])

    return (
        <div className="App">

            <div className='col1'>

                <div onClick={() => setSelect(["send", "hidden", "send", "hidden"])} className='but1'></div>
                <div onClick={() => setSelect(["hidden", "send", "send", "hidden"])} className='but2'></div>
                <div onClick={() => setSelect(["hidden", "hidden", 'hidden', "send"])} className='but3'></div>
            </div>

            <div className={select[2]}>
        <div className='col2'>
        <div className={select[0]}>
                    <div className='App2'>
                       <div className='add'>
                       <input type="text" className='addsender' value={newsender} onChange={(e) => setNewsender(e.target.value)} />
                        <button onClick={handlesubmit} className='addsenderbut'>Add user</button>
                       </div>
                        {
                            sender.map((senderName, index) => (
                                <div key={index}>
                                    {senderName.sender != "" ? <div className='col2list'>
                                        <img src={senderName.profilephoto} alt="profilephoto" className='profilephoto' />
                                        <div className='listbut' onClick={() => { Cookies.set("select", JSON.stringify({ sender: senderName.sender, messagefor: senderName.messagefor })); window.location.reload() }}>{senderName.sender}</div>
                                    </div>
                                        : <div></div>}
                                </div>
                            ))
                        }
                    </div>
                </div>

                {
                    groupcompoactive ? <div className={select[1]}><div className='App2' style={{ height : "90vh"}}><Addgroup handlegroupcomactive={handlegroupcomactive} /></div></div> : <div className={select[1]} onClick={handlegroupcomactive} id='addgroupbut'
                    style={{
                        height : 50,
                        width : 50,
                        backgroundColor : 'rgb(29, 28, 28)',
                    }}
                    ></div>}
        </div>

            </div>

            <div className={select[2]}  style={{overflow : "scroll" , overflowX : 'hidden'}}> <div><Sendmessage /></div></div>
            <div className={select[3]}><div><Status /></div></div>
        </div>
    );
}

export default Home;