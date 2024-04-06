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
        <div className="login" style={{height : "100vh" , width : '100vw'}}>
            <h2 className="" style={{fontSize : 75 , fontWeight : 'bold'}}>Verify OTP</h2>
            <form onSubmit={handleSubmit} style={{display : 'flex' , flexDirection : 'column' , justifyContent : 'center' , alignItems : 'center'}}>
                <div style={{display : 'flex' , flexDirection : 'column'}}>
                    <label htmlFor="username" style={{fontSize : 20 , fontWeight : 'bold'}}>Enter OTP:</label>
                    <input
                        type="number"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{width : 300 , height : 30 , borderRadius : 5 , marginTop : 15}}
                    />
                </div>
                <div style={{height : 50 , width : 50  }} onClick={handleSubmit} type="submit" className='verifyotp'>login</div>
            </form>
        </div>
    );
}