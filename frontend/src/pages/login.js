import React from "react";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


export default function Login()
{
  const navigate = useNavigate();
    const [email, setEmail] = useState('Email');
  
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
        <div className="login" style={{backgroundColor : 'black' , height : '100vh' , width : '100vw'}}>
        <div style={{fontSize : 75 , fontWeight : 'bold'}}>Login !</div>
        <form onSubmit={handleSubmit} style={{display : "flex" , flexDirection : 'column' , justifyContent : 'center' , alignItems : 'center'}}>
            
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{width : 300 , height : 30 , borderRadius : 5 , marginTop : 25}}
            />
          <div onClick={handleSubmit} className="loginbut" style={{height : 50 , width : 50  }}>Login</div>
        </form>
      </div>
    );
}