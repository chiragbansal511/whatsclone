
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup()
{   
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
      <div className="">
        <img src={postImage.myFile} alt="Profilephoto" height="100" width="100" />
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

          <label>Profile Photo</label>
          <input type="file" accept=".jpeg , .png , .jpg" onChange={handleFileUpload}/>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
}