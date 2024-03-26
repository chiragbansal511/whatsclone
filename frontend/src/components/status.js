import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import socket from '../socket';

export default function Status() {

    const [statuslist , setStatuslist] = useState([""]);

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
                        list.push({ sender: status.name , status : status.message});
                        setStatuslist(prevStatuslist=>[{ sender: status.name , status : status.message} , ...prevStatuslist]);
                    }
                }

                else {
                    list = [{ sender: status.name , status : status.message}];
                    setStatuslist([{ sender: status.name , status : status.message}]);
                }

                localStorage.setItem("status", JSON.stringify(list));
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

    useEffect(() => {
        getstoredofflinestatus()
        getstoredofflinecomment()
    }, [])

    return (
        <div>


        </div>
    )
}