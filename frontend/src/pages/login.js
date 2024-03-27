import React from "react";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


export default function Login()
{
  const navigate = useNavigate();
    const [email, setEmail] = useState('');
  
    async function handleSubmit(e){
      e.preventDefault();
      
      const response = await axios.post('http://localhost:80/login/getopt', {
      email : email
      });
      
      console.log(response.data);
      if(response.data == "use not found")
      {
        alert("wrong Email");
      }
      else
      navigate("/verify" , {state : {data : email , type : "login"}});
    };

    return(
        <div className="">
        <h2 className=" text-red-800">Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Email:</label>
            <input
              type="email"
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