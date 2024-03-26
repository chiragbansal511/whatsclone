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
                    <div onClick={() => setMembers(prevMembers => [{sender : e.sender , messagetype : "group"}, ...prevMembers])}>{e.sender}</div>
                : <div></div>}
                    </div>
                )) : <div>
                    <img src={postImage.myFile} alt="photo" />
                    <input type="text" value={groupdataname} onChange={(e) => setGroupdataname(e.target.value)} />
                    <input type="file" accept=".jpeg , .png , .jpg" onChange={handleFileUpload} />
                </div>
            }
            <button onClick={handleclick}>Add</button>
        </div>
    )
}

