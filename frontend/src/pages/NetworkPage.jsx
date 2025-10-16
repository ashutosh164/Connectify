import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";


export default function Network() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);

  useEffect(() => {
      api.get("/my-invite/",{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) => {
        // console.log(res);
        console.log('invite_profile_list_view====>>',res);
        setProfiles(res.data.data)
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 56px)" }}>
      <h2 className="text-xl font-bold text-gray-700 mb-5">People You May Know</h2>

           {profiles && profiles.length > 0 ? (profiles.map((person) => (
             <div key={person.id} className="relative  bg-white shadow rounded-lg flex  items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2">
      <div className="shrink-0">
        <img alt={person.full_name || person.username} src={person.image || "/default.png"} className="h-10 w-10 rounded-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{person.full_name || person.username}</p>
        <p className="truncate text-sm text-gray-400">
          {person.role || "Software developer"}
        </p>
      </div>
      <div onClick={() => acceptConnection(person.id)} className="flex items-center cursor-pointer space-x-2">

          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium cursor-pointer hover:bg-green-500/20">
           Accept
          </span>
       
      </div>
            </div>
          ))) : (
      <p className="text-center text-gray-400 py-4">No profiles found.</p>
    )}
        </div>
      )}
 
