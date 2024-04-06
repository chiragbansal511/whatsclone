import axios from "axios";
import { useEffect, useState } from "react"
import Cookies from "js-cookie";

export default function Addgroup(props) {
    const [list, setList] = useState([""]);
    const [members, setMembers] = useState([]);
    const [groupdataname, setGroupdataname] = useState("name");
    const [datacompo, setDatacompo] = useState(false);
    const [postImage , setPostImage] = useState("");

    useEffect(() => {
        let list = localStorage.getItem("sender");
        if (list != null) {
            list = JSON.parse(list);
            setList(list);
        }

    }, [])


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


    async function handleclick() {
        if (datacompo) {
            const response = await axios.post('http://localhost:80/group',
                {
                    name: groupdataname,
                    members: members,
                    profilephoto : postImage.myFile
                },

                {
                    headers: {
                        Authorization: "Bearer " + Cookies.get("accessToken")
                    }
                }
            )
            props.handlegroupcomactive()
            console.log(response);
        }
        setDatacompo(!datacompo);
    }

    return (
        <div>
            {
                !datacompo ? list.map((e, index) => (
                    <div key={index}>
                 { e.messagefor != "group" ?
                    <div style={{marginTop : 10}} id="grouplist" onClick={() => setMembers(prevMembers => [{sender : e.sender , messagetype : "group"}, ...prevMembers])}>{e.sender}</div>
                : <div></div>}
                    </div>
                )) : <div style={{display : "flex" , flexDirection : 'column' , justifyContent : 'center' , alignItems : 'center'}}>
                    <img src={postImage.myFile} style={{marginTop : 30 , height : "10vh" , width : "10vh" , backgroundColor : 'white' , borderRadius : 100}}/>
                    <div style={{color : 'white' , fontSize : 15 , marginTop : 5    }}>Profile Photo</div>
                    <input style={{marginTop : 10}} type="text" value={groupdataname} onChange={(e) => setGroupdataname(e.target.value)} />
                    <input type="file" accept=".jpeg , .png , .jpg" onChange={handleFileUpload} />
                </div>
            }
            <div style={{marginTop : 10 }} id="creategroupbut" onClick={handleclick}></div>
        </div>
    )
}

