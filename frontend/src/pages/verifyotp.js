import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from 'react';

export default function Verifyopt() {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState("");
    const dataReceived = location.state.data;
    const profilephoto = location.state.profilephoto;

    console.log(dataReceived);
    async function handleSubmit(e) {
        e.preventDefault();

        const response = await axios.post(`http://localhost:80/${location.state.type}/verifyopt`, {
            email: dataReceived,
            opt : otp,
            profilephoto : profilephoto
        });

        console.log(response);
        Cookies.set("accessToken", response.data.accessToken);
        Cookies.set("your" , dataReceived);
        navigate("/home");
        window.location.reload();
    };


    return (
        <div className="">
            <h2 className=" text-red-800">Verify OTP</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Enter OTP:</label>
                    <input
                        type="number"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    );
}