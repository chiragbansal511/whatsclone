import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import socket from '../socket';
import { useRef } from 'react';

export default function Status() {

    const [statuslist, setStatuslist] = useState([""]);
    const [select, setSelect] = useState("");
    const [status, setStatus] = useState("");
    const [comment, setComment] = useState([""]);
    const [postImage, setPostImage] = useState("");
    const [newcomment, setNewcomment] = useState("");
    const profileref = useRef(null);

    async function removestatus(sender) {
        console.log("remove")
        setTimeout(() => {

            let prevStatuslist = localStorage.getItem("status");
            prevStatuslist = JSON.parse(prevStatuslist);
            const newPrevStatuslist = prevStatuslist.filter(item => {
                return item.sender !== sender.name || item.status.myFile !== sender.message.myFile;
            });
            localStorage.setItem("status", JSON.stringify(newPrevStatuslist));
            setStatuslist(newPrevStatuslist);
            console.log(newPrevStatuslist);
            localStorage.removeItem(`status,${sender.name}`);
        }, 10 * 60 * 1000);
    }

    async function getstoredofflinestatus() {
        try {
            const response = await axios.get('http://localhost:80/getstatus', {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            response.data.forEach(async (element) => {

                const status = {
                    type: "status",
                    message: element.message,
                    time: element.time,
                    sender: element.sender,
                    name: element.name,
                }

                let list = localStorage.getItem("status");
                if (list != null) {
                    list = JSON.parse(list);
                    const res = list.find((e) => e.name == status.name);
                    if (res == null) {
                        list.push({ sender: status.name, status: status.message });
                        setStatuslist(prevStatuslist => [{ sender: status.name, status: status.message }, ...prevStatuslist]);
                    }
                }

                else {
                    list = [{ sender: status.name, status: status.message }];
                    setStatuslist([{ sender: status.name, status: status.message }]);
                }

                localStorage.setItem("status", JSON.stringify(list));

                removestatus(status);
            });

        } catch (error) {

        }
    }

    async function getstoredofflinecomment() {
        try {
            const response = await axios.get('http://localhost:80/getcomment', {
                headers: {
                    Authorization: "Bearer " + Cookies.get("accessToken")
                }
            });

            response.data.forEach(async (element) => {

                const comment = {
                    type: "comment",
                    message: element.message,
                    sender: element.sender,
                    name: element.name
                }

                let prevstatus = localStorage.getItem(`status,${comment.name}`);
                if (prevstatus != undefined) {
                    prevstatus = JSON.parse(prevstatus);
                    prevstatus.push(comment);
                }

                else {
                    prevstatus = [comment];
                }
                localStorage.setItem(`status,${comment.name}`, JSON.stringify(prevstatus));

            });

        } catch (error) {

        }
    }

    async function sendcomment() {
        console.log(newcomment, select);

        try {

            const response = await axios.post('http://localhost:80/comment',

                {
                    message: newcomment,
                    name: select
                },

                {
                    headers: {
                        Authorization: "Bearer " + Cookies.get("accessToken")
                    }
                });

            console.log(response);
            const comment = {
                type: "comment",
                message: newcomment,
                sender: "you",
                name: select
            }

            let prevstatus = localStorage.getItem(`status,${comment.name}`);
            if (prevstatus != undefined) {
                prevstatus = JSON.parse(prevstatus);
                prevstatus.push(comment);
                setComment(e => [...e, comment]);
            }

            else {
                prevstatus = [comment];
                setComment([comment]);
            }
            localStorage.setItem(`status,${comment.name}`, JSON.stringify(prevstatus));

        } catch (error) {

        }
    }

    async function handlestatus() {
        try {
            const response = await axios.post('http://localhost:80/status',

                {
                    message: postImage,
                    list: JSON.parse(localStorage.getItem("sender"))
                },

                {
                    headers: {
                        Authorization: "Bearer " + Cookies.get("accessToken")
                    }
                });

            console.log(response)
            const status = {
                type: "status",
                message: postImage,
                name: Cookies.get("your"),
            }

            removestatus(status);

            let list = localStorage.getItem("status");
            if (list != undefined) {
                try {
                    list = JSON.parse(list);
                    list.push({ sender: status.name, status: status.message });
                    setStatuslist(e => [{ sender: status.name, status: status.message }, ...e]);
                } catch (error) {
                    console.error('Error fetching profile photo:', error);
                }
            }

            else {
                console.log("hello");
                list = [{ sender: status.name, status: status.message }];
                setStatuslist([{ sender: status.name, status: status.message }])
            }

            localStorage.setItem("status", JSON.stringify(list));
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
        setPostImage({ myFile: base64 });
        console.log(postImage, "postimage");
        console.log(base64);
    };


    useEffect(() => {

        let comment = localStorage.getItem(`status,${select}`);
        console.log(comment);
        setComment(JSON.parse(comment));

    }, [select])

    useEffect(() => {

        const fetchDataAndHandleMessage = async (data) => {


            if (data.type == "status") {
                const status = {
                    type: "status",
                    message: data.message,
                    time: data.time,
                    sender: data.sender,
                    name: data.name,
                }
                removestatus(status);
                let list = localStorage.getItem("status");
                if (list != undefined) {
                    try {
                        list = JSON.parse(list);
                        list.push({ sender: status.name, status: status.message });
                        setStatuslist(e => [{ sender: status.name, status: status.message }, ...e]);
                    } catch (error) {
                        console.error('Error fetching profile photo:', error);
                    }
                }

                else {
                    console.log("hello");
                    list = [{ sender: status.name, status: status.message }];
                    setStatuslist([{ sender: status.name, status: status.message }])
                }

                localStorage.setItem("status", JSON.stringify(list));
            }

            else {
                const comment = {
                    type: "comment",
                    message: data.message,
                    sender: data.sender,
                    name: data.name
                }

                console.log(comment.name , "name");
                let prevmessage = localStorage.getItem(`status,${comment.name}`)
                if (prevmessage != undefined) {
                    prevmessage = JSON.parse(prevmessage);
                    prevmessage.push(comment);
                    if (comment.name === Cookies.get("statusselect")) {
                        setComment(e => [...e, comment]);
                    }
                } else {
                    prevmessage = [comment];
                    if (comment.name === Cookies.get("statusselect")) {
                        setComment([comment]);
                    }
                }
                localStorage.setItem(`status,${comment.name}`, JSON.stringify(prevmessage));
                console.log(comment.name , Cookies.get("statusselect"));
                if (comment.name === Cookies.get("statusselect")) {
                    setComment(e => [comment, ...e]);
                }
    
            }
            
            console.log(statuslist);
        };

        socket.on("comment_status", fetchDataAndHandleMessage);

        return () => {
            socket.off("comment_status", fetchDataAndHandleMessage);
        };
    }, []);

    useEffect(() => {
        getstoredofflinestatus()
        getstoredofflinecomment()
    }, [])

    useEffect(() => {

        let list = localStorage.getItem('status');
        setStatuslist(JSON.parse(list));
    }, [])

    return (
        <div className='App1'>

            <div className='col2'>
                <img onClick={() => { profileref.current.click(); }} src={postImage.myFile} alt="status" style={{ height: "10vh", width: "10vh", borderRadius: 10, backgroundColor: "white", marginTop: 10, marginBottom: 10 }} className='addstatusbut' />
                <div onClick={()=> handlestatus()} className="addstatusbutton" ></div>
                <input type="file" name="" id="" accept='.jpeg , .png , .jpg' onChange={handleFileUpload} style={{ display: 'none' }} ref={profileref} />
                {
                    statuslist != null ? statuslist.map((element, index) => (
                        <div key={index}>
                            {
                                element != "" ? <div className='statuslist' style={{ marginTop: 10, fontWeight: "bold", fontSize: "2.3vh" }} onClick={() => { setSelect(element.sender); Cookies.set( "statusselect" , element.sender); setStatus(element.status) }}>{element.sender}</div> : <div></div>
                            }
                        </div>
                    )) : <div></div>
                }
            </div>

            <div className='col3'>

                <img src={status.myFile} alt="status" style={{ scale: "1", justifySelf: 'start', marginTop: 10 }} />
                <div style={{ fontSize: 40, fontWeight: 'bold' }}>comments</div>
                <div style={{ overflow : 'scroll'  , overflowX : 'hidden'}}>

                {
                    comment != null ? comment.map((e, index) => (
                        <div key={index} style={{display : 'flex' , flexDirection : 'column' , width : '75vw'}}>
                            {
                                e.sender == "you" ? <div style={{alignSelf : 'flex-end' , marginRight : '5px' , marginBottom : "10px"}}>
                                    <div> {e.sender}</div>
                                    <div> {e.message}</div>
                                </div> :
                                    <div style={{alignSelf : 'flex-start' , marginLeft : '5px' , marginBottom : '10px'}}>
                                        <div> {e.sender}</div>
                                        <div> {e.message}</div>
                                    </div>
                            }
                        </div>
                    )) : <div>no comment</div>
                }
                </div>

                <div style={{display : 'flex' , justifyContent : 'center' , alignItems : 'center'}}>
                <input type="text" value={newcomment} onChange={(e) => setNewcomment(e.target.value)} className='sendmessage'/>
                <div onClick={sendcomment} className='sendbut'></div>
                </div>
            </div>
        </div>
    )
}