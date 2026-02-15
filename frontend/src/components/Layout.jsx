import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import Header from "./Header";
import { useAuth } from "../AuthContext";
import api from "../api"
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Network from "../pages/NetworkPage";
import MyFollowers from "../pages/MyFollowers";
import Chat from "./Chats"

import { Routes, Route } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";


export default function Layout() {
  const [profile, setProfile] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("/");
  const location = useLocation(); // track current path


  useEffect(() => {

     if (!user || !user.token) {
    navigate("/login");
    return;
  }
    api.get("/api/profiles/me/", {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) =>{
         setProfile(res.data)
      })
      .catch((err) =>{
         console.error("Error fetching posts:", err)
         navigate('/login')
      });
  }, []);


  return (
    <div className="h-screen flex flex-col">
      <Header onNavigate={setActivePage} />

      <div className="flex flex-1 pt-14 gap-3 bg-green-500/10">

  {/* LEFT SIDEBAR (SMALLER) */}
  <div className="hidden sm:block w-[18%] p-4">
    <div className="fixed w-[18%]">
      <LeftSidebar profile={profile} />
    </div>
  </div>

  {/* MIDDLE / FEED (WIDER) */}
  <div className="flex-1 px-2">
    <Routes>
      <Route path="/" element={<Feed profile={profile} />} />
      <Route path="/my-network" element={<Network />} />
      <Route path="/my" element={<MyFollowers />} />
      <Route path="/chat" element={<Chat username={user.user_id} />} />
    </Routes>
  </div>

  {/* RIGHT SIDEBAR (UNCHANGED) */}
  <div className="hidden md:block w-1/4 p-4">
    <div className="fixed right-3 w-1/4">
      <RightSidebar />
    </div>
  </div>

</div>



      {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 pt-14 gap-3 bg-green-500/10 ">

        <div className="col-span-1 p-4 hidden sm:block">
          <div className="fixed w-1/4">
            <LeftSidebar profile={profile} />
          </div>
        </div>

        <div className="col-span-3">
          <Routes>
            <Route path="/" element={<Feed profile={profile} />} />
            <Route path="/my-network" element={<Network />} />
            <Route path="/my" element={<MyFollowers />} />
            <Route path="/chat" element={<Chat conversationId={1} />} />
          </Routes>
        </div>

        <div className="col-span-2 p-4 hidden md:block">
          <div className="fixed right-3 w-1/4">
            <RightSidebar />
          </div>
        </div>
      </div> */}



    </div>
  );
}
