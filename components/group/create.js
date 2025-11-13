"use client"
// import Gstyle from "../../app/globals.css";
import Mstyle from "../styles/group.module.css";
import Link from 'next/link';
import { useState } from "react";
import UserProfile from '../../app/session/UserProfile';
import { createGroup } from "@/lib/group";
import { useRouter } from "next/navigation";

export default function create() {
    const [group, setGroup] = useState({name: ""});
    const router = useRouter();
    const handleChange = (e) => {
        setGroup(prev => ({
        ...prev,
        [e.target.name]: e.target.value
        }));
    };

    const handleCreate = async (e) => {
    try {
      console.log("User email: "+UserProfile.getEmail())
      const createSuccess = await createGroup(UserProfile.getEmail(), group.name);      
      if (createSuccess.success) {
        UserProfile.setGName(group.name);
        console.log(UserProfile.getGName())
        router.push('/mainPage')
      } else{
        throw new Error(createSuccess.error)
      }
    } catch (error) {
      console.error('Create failed:', error);
    }
  };
    return (
        <div className={Mstyle.page}>
            <div className={Mstyle.main}>
                    <h3>Make your own group!</h3>
                <form className={Mstyle.connForm}>
                    <div className={Mstyle.Uname} >
                        <input 
                            placeholder="Type a name of your group" 
                            type="text"
                            name="name"
                            value={group.name}
                            onChange={handleChange}
                            required
                        />
                        <img src="/icon/pen_Icon.png" alt="Pen Icon" className={Mstyle.penIcon} />
                    </div>
                    <Link href="/mainPage" onNavigate={(e) => {e.preventDefault(); handleCreate()}}><button type="submit">Create Group</button></Link>
                    
                </form>
                <div className={Mstyle.createLink}>
                    <p>Want to connect to a group? <Link href="/join">Click here!</Link></p>
                </div>
            </div>
        </div>
    )
}