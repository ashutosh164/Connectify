import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";


export default function MyFollower() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    getFolloerList()
  }, [location.key]);

  function getFolloerList () {
        api.get("/my-followers/", {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      })
      .then((res) => {
        console.log("invite_profile_list_view====>>", res.data.results);
        const data = res.data.results.map((p) => ({ ...p, accepted: false }));
        setProfiles(data);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }


  return (
    <div>
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 56px)" }}>
            <div className="bg-white shadow p-4 rounded-lg mb-4">
                <div className="flex w-full items-center space-x-4">
                    <Link to="/my-network" className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition">
                        <span className="text-sm font-medium cursor-pointer">my network</span>
                    </Link>
      
                    <Link to="/my" onClick={() => getFolloerList()}  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition">
                    <span className="text-sm font-medium cursor-pointer">my </span>
                    </Link> 
                </div>
            </div>
        <h2 className="text-xl font-bold text-gray-700 mb-5">People You May Know</h2>

        {profiles && profiles.length > 0 ? (
            profiles.map((person) => (
            <div key={person.id} className="relative bg-white shadow rounded-lg flex items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2">
                <div className="shrink-0">
                <img alt={person.full_name || person.username} src={person.image || "/default.png"} className="h-10 w-10 rounded-full"/>
                </div>
                <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                    {person.full_name || person.username}
                </p>
                <p className="truncate text-sm text-gray-400">
                    {person.role || "Software Developer"}
                </p>
                </div>

                {!person.accepted ? (
                    <div className="flex justify-between gap-2 ">
                       
                    </div>
                ) : (
                <span className="text-green-600 text-sm font-medium">Connected</span>
                )}
            </div>
            ))
        ) : (
            <p className="text-center text-gray-400 py-4">No profiles found.</p>
        )}
        </div>
    </div>
  );
}
