import axios from "axios";
import { useEffect, useState } from "react"
import Cookies from "js-cookie";

export default function Addgroup(props) {
    const [list, setList] = useState([""]);
    const [members, setMembers] = useState([]);
    const [groupdataname, setGroupdataname] = useState("name");
    const [datacompo, setDatacompo] = useState(false);
    

    useEffect(() => {
        let list = localStorage.getItem("sender");
        if (list != null) {
            list = JSON.parse(list);
            setList(list);
        }

    }, [])

    async function handleclick() {
        if (datacompo) {
            const response = await axios.post('http://localhost:80/group',
                {
                    name: groupdataname,
                    members: members,
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
                        <div onClick={() => setMembers(prevMembers => [{sender : e.sender , messagetype : "group"}, ...prevMembers])}>{e.sender}</div>
                    </div>
                )) : <div>
                    <input type="text" value={groupdataname} onChange={(e) => setGroupdataname(e.target.value)} />
                </div>
            }
            <button onClick={handleclick}>Add</button>
        </div>
    )
}

