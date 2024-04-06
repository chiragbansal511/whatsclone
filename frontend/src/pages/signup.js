
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Signup()
{   
  const profilephotoref = useRef(null);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [postImage , setPostImage] = useState("");

  async function handleSubmit(e){
    e.preventDefault();
    console.log(postImage.myFile)
    const response = await axios.post('http://localhost:80/signup/getopt', {
    email : email,
    });
    
    console.log(response.data);
    navigate("/verify" , {state : {data : email , type : "signup" , profilephoto : postImage.myFile}});
  };

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
    setPostImage({myFile: base64 });
    console.log(postImage , "postimage");
    console.log(base64);
};


  return(
      <div  className="login" style={{backgroundColor : 'black' , height : '100vh' , width : '100vw'}}>
        <img src={postImage.myFile} height="100" width="100" style={{backgroundColor : '#131313' , borderRadius : 5}} onClick={()=>{profilephotoref.current.click()}} />
      <div style={{fontSize : 20 , marginTop : 15}}>Profile Photo</div>
      <div style={{fontSize : 75 , fontWeight : 'bold'}}>Signup !</div>
      <form onSubmit={handleSubmit} style={{display : 'flex' , flexDirection : 'column' , justifyContent : 'center' , alignItems : 'center'}}>
        <div style={{display : 'flex' , flexDirection : 'column'}}>
          <label htmlFor="username" style={{fontSize : 20 , fontWeight : 'bold' , marginTop : 15}}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{width : 300 , height : 30 , borderRadius : 5 , marginTop : 10}}

          />

          <input type="file" accept=".jpeg , .png , .jpg" onChange={handleFileUpload} style={{display : "none"}} ref={profilephotoref}/>
        </div>
        <div onClick={handleSubmit} style={{height : 50 , width : 50  }}  type="submit" className="signupbut">Signup</div>
      </form>
    </div>
  );
}