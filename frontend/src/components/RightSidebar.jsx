import { useState, useEffect } from "react";
import api from "../api";

export default function RightSidebar() {
  const [profile, setProfile] = useState([]);
  const [status, setStatus] = useState({}); // { id: 'idle' | 'loading' | 'Pending' }

  useEffect(() => {
    api.get("/profiles/")
      .then((res) => {
        console.log(res);
        setProfile(res.data.results);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  const sendConnection = async (id) => {
    setStatus((prev) => ({ ...prev, [id]: "loading" }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus((prev) => ({ ...prev, [id]: "Pending" }));
    } catch (err) {
      console.error("Error sending connection:", err);
      setStatus((prev) => ({ ...prev, [id]: "idle" }));
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">People you may know</h3>
      {profile.map((person) => (
        <div
          key={person.id}
          className="relative bg-white shadow rounded-lg lg:flex md:block items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2"
        >
          <div className="shrink-0">
            <img alt="" src={person.image} className="h-10 w-10 rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{person.full_name?person.full_name:person.username}</p>
            <p className="truncate text-sm text-gray-400">
              {person.role ? person.role : "Software developer"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {status[person.id] === "loading" ? (
              <div className="w-6 h-6 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
            ) : status[person.id] === "Pending" ? (
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                Pending
              </span>
            ) : (
              <span
                onClick={() => sendConnection(person.id)}
                className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium cursor-pointer hover:bg-green-500/20"
              >
                Connect
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
