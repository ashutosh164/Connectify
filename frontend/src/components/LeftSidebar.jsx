import api from "../api"
import { useNavigate } from "react-router-dom";


export default function LeftSidebar({profile}) {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.get("/logout/")

      if (response.status === 200) {
           localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login")
      } 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };


  return (
    <div>
      <div className=" bg-white shadow rounded-lg">

        <ul role="list" className="grid grid-cols-1 gap-6 ">
        {/* {profile.map((profile) => ( */}
          <li
            key={profile.email}
            className="col-span-1 flex flex-col divide-y divide-white/10 rounded-lg outline -outline-offset-1 outline-white/10"
          >
            <div className="flex flex-1 flex-col p-8">
              <img alt="No profile found" src={profile.image} className="mx-auto size-32 shrink-0 rounded-full bg-gray-700 outline -outline-offset-1 outline-white/10"
              />
              <h3 className="mt-6 text-sm font-medium">{profile.username}</h3>
              <dl className="mt-1 flex grow flex-col justify-between">
                <dt className="sr-only">Title</dt>
                <dd className="text-sm text-gray-400">{profile.role?profile.role:'Software developer'}</dd>
                <dt className="sr-only">Role</dt>
                <dd className="mt-3 flex justify-between">
                  <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 inset-ring inset-ring-green-500/10 sr-only">
                    {profile.role?profile.role:"Software developer"}
                  </span>
                    <span  onClick={handleLogout} className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 inset-ring inset-ring-red-500/10 cursor-pointer">
                    Logout
                  </span>
                </dd>
              </dl>
            </div>
        
          </li>
        {/* ))} */}
      </ul>
    
      </div>

      <div className='bg-white shadow rounded-lg mt-2 p-6'>
             <div className="flex items-center justify-between space-x-3">
                <h3 className="truncate text-sm font-medium ">Profile view</h3>
                <span className="inline-flex shrink-0 items-center rounded-full  px-1.5 py-0.5 text-xs font-medium text-green-500 inset-ring inset-ring-green-500/10">
                  33
                </span>
              </div>
              <div className="flex mt-2 justify-between items-center space-x-3">
                <h3 className="truncate text-sm font-medium ">Post Impressions</h3>
                <span className="inline-flex shrink-0 items-center rounded-full  px-1.5 py-0.5 text-xs font-medium text-green-500 inset-ring inset-ring-green-500/10">
                  33
                </span>
              </div>

              <div className="flex mt-2 justify-between items-center space-x-3">
                <h3 className="truncate text-sm font-medium ">Follower</h3>
                <span className="inline-flex shrink-0 items-center rounded-full  px-1.5 py-0.5 text-xs font-medium text-green-500 inset-ring inset-ring-green-500/10">
                  {profile.total_followers}
                </span>
              </div>
      </div>
    </div>

    
  );
}
