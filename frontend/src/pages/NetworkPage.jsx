import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";


export default function Network() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);

  useEffect(() => {
  api.get("/invite-profile-list/",{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) => {
        // console.log(res);
        console.log('invite_profile_list_view====>>',res);
        setProfiles(res.data)
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 56px)" }}>
      <h2 className="text-xl font-bold text-gray-700">People You May Know</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white p-4 rounded-lg shadow-md text-center"
            >
              <img
                src={profile.image}
                alt={profile.first_name}
                className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
              />
              <h3 className="font-semibold">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-gray-500">{profile.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
