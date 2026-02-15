import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
    const navigate = useNavigate();

    const { user } = useAuth();
    const [profile, setProfile] = useState([]);
    const [status, setStatus] = useState({}); 

  useEffect(() => {

         if (!user || !user.token) {
    navigate("/login");
    return;
  }
  getAllUserList()

  }, []);

  function getAllUserList() {
        api.get("/api/profiles/exclude-me/",{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) => {
        // console.log(res);
        setProfile(res.data.results);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }

  // const sendConnection = async (id) => {
  //   setStatus((prev) => ({ ...prev, [id]: "loading" }));

  //   try {
  //     // await api.post("/api/send-invite/", { profile_id: id },{

  //     await api.post("/api/follow/", { profile_id: id },{
  //     headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
  //   })
  // .then(res => {
  //   if (res.data.action === 'unfollowed') {
  //       setStatus((prev) => ({ ...prev, [id]: "Connect" }));
  //       console.log('unfollowed=====>>>', status)

  //   } else if(res.data.action === 'followed') {
  //     setStatus((prev) => ({ ...prev, [id]: "Connected" }));
  //     console.log('followed=====>>>', status)


  //   }
  // });
  //   } catch (err) {
  //     console.error("Error sending connection:", err);
  //   }
  // };

  function getInviteList() {
     api.get("/api/invite-profile-list/",{
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
      .then((res) => {
        // console.log(res);
        console.log('invite_profile_list_view====>>',res.data.results);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }

  const sendConnection = async (id) => {
    setStatus((prev) => ({ ...prev, [id]: "loading" }));

    try {
      await api.post("/api/send-invite/", { profile_id: id },{

      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
  .then(res => {
    console.log(res)
    // getInviteList()
    getAllUserList()
    if (res.data.action === 'unfollowed') {
        setStatus((prev) => ({ ...prev, [id]: "Connect" }));
        console.log('unfollowed=====>>>', status)

    } else if(res.data.action === 'followed') {
      setStatus((prev) => ({ ...prev, [id]: "Connected" }));
      console.log('followed=====>>>', status)
    }
    // if (res.data.status === 200) {
    //   setStatus((prev) => ({ ...prev, [id]: "Pending" }));
    // }
  });
    } catch (err) {
      console.error("Error sending connection:", err);
    }
  };

  return (

    <div>
    <div className="bg-white shadow rounded-lg p-4 h-[50vh] flex flex-col">

  {/* SCROLLABLE CONTENT */}
  <div className="flex-1 overflow-y-auto">
    <h2 className="font-bold mb-2">Recently Online Experts</h2>
    {profile && profile.length > 0 ? (
      profile.map((person) => (
        <div
          key={person.id}
          className="lg:flex md:block items-center space-x-3 mb-2"
        >
          <div className="shrink-0">
            <img
              alt={person.full_name || person.username}
              src={person.image || "/default.png"}
              className="h-10 w-10 rounded-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {person.full_name || person.username}
            </p>
            <p className="truncate text-sm text-gray-400">
              {person.role || "Software developer"}
            </p>
          </div>

          <div
            onClick={() => sendConnection(person.id)}
            className="flex items-center cursor-pointer space-x-2"
          >
            {status[person.id] === "loading" ? (
              <div className="w-6 h-6 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
            ) : (
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20">
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

  {/* BUTTON AT BOTTOM CENTER */}
  <button type="button" className="mt-auto mx-auto w-full rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-green-600">View all</button>

</div>


      {/* <div className="bg-white shadow rounded-lg mt-2 p-4 h-[30vh]"> */}
        <h3 className="mb-3 text-sm font-medium">Only for Add</h3>

      {/* </div> */}








    </div>
  );
}
