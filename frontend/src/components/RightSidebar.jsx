import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function RightSidebar() {
    const { user } = useAuth();
    const [profile, setProfile] = useState([]);
    const [status, setStatus] = useState({}); // { id: 'idle' | 'loading' | 'Pending' }

  useEffect(() => {
    api.get("/profiles/exclude-me/",{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) => {
        console.log(res);
        setProfile(res.data.results);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  const sendConnection = async (id) => {
    setStatus((prev) => ({ ...prev, [id]: "loading" }));

    try {
      // await api.post("/send-invite/", { profile_id: id },{

      await api.post("/follow/", { profile_id: id },{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
  .then(res => {
    if (res.data.action === 'unfollowed') {
        setStatus((prev) => ({ ...prev, [id]: "Connect" }));
        console.log('unfollowed=====>>>', status)

    } else if(res.data.action === 'followed') {
      setStatus((prev) => ({ ...prev, [id]: "Connected" }));
      console.log('followed=====>>>', status)


    }
  });
    } catch (err) {
      console.error("Error sending connection:", err);
    }
  };


  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">People you may know</h3>
    {profile && profile.length > 0 ? (
  profile.map((person) => (
    <div key={person.id} className="relative bg-white shadow rounded-lg lg:flex md:block items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2">
      <div className="shrink-0">
        <img
          alt={person.full_name || person.username}
          src={person.image || "/default.png"}  // fallback image
          className="h-10 w-10 rounded-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{person.full_name || person.username}</p>
        <p className="truncate text-sm text-gray-400">
          {person.role || "Software developer"}
        </p>
      </div>
      <div onClick={() => sendConnection(person.id)} className="flex items-center cursor-pointer space-x-2">
        {status[person.id] === "loading" ? (
          <div className="w-6 h-6 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        ) : status[person.id] === "Connected" ? (
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">Connected</span>
        ) : status[person.id] === "Connect" ? (
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">Connect</span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium cursor-pointer hover:bg-green-500/20">
            {person.is_following ? "Connected" : "Connect"}
          </span>
        )}
      </div>
    </div>
  ))
    ) : (
      <p className="text-center text-gray-400 py-4">No profiles found.</p>
    )}

    </div>
  );
}
