import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import Header from "./Header";
import { useAuth } from "../AuthContext";
import api from "../api"
import { useEffect, useState } from 'react';


export default function Layout() {
  const [profile, setProfile] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/me/", {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) =>{
         setProfile(res.data)
         console.log('me===>>', res.data)
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);



  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Body */}
      <div className="flex flex-1 pt-14 gap-3">
        {/* Left Sidebar */}
        <div className="w-1/4 p-4 hidden sm:block">
          <div className="fixed w-1/4">
            <LeftSidebar profile={profile} />
          </div>
        </div>

        {/* Feed */}
        {/* <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 56px)" }}> */}
        <div className="flex-1">
          <Feed profile={profile}/>
          {/* <AddPostModal/> */}
        </div>

        {/* Right Sidebar (hidden on small screens) */}
        <div className="w-1/4 p-4 hidden md:block">
          <div className="fixed right-0 w-1/4">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
