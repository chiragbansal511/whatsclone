
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Signup()
{   
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    
    const response = await axios.post('http://localhost:80/signup/getopt', {
    email : email
    });
    
    console.log(response.data);
    navigate("/verify" , {state : {data : email , type : "signup"}});
  };

  return(
      <div className="">
      <h2 className=" text-red-800">Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
}