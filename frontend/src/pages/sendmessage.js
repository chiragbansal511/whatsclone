import { useLocation } from "react-router-dom"
import Cookies from "js-cookie";
import { useState , useEffect} from "react";

export default function Sendmessage()
{
const location = useLocation();
const data = location.state.data;
const socket = location.state.socket;
console.log(socket , "socket");
// const [message, setMessage] = useState([]);
// const mess = Cookies.get(data);
// setMessage(JSON.parse(mess));


// async function 
// useEffect(() => {
  
// }, [])

    return (
        <div>
            {/* {message != undefined ? JSON.stringify(message) : ""} */}
        </div>
    )
}