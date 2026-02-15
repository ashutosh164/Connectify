import api from "../api"
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../utiles/stringUtils";

import { Link, useLocation } from "react-router-dom";


import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  ArrowRightEndOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Feed', href: '/', icon: HomeIcon, count: '5', current: true },
  { name: 'Team', href: '/my-network', icon: UsersIcon, current: false },
  { name: 'Follower', href: '/my', icon: FolderIcon, count: '12', current: false },
  { name: 'Calendar', href: '#', icon: CalendarIcon, count: '20+', current: false },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  { name: 'Logout', href: '#', icon: ArrowRightEndOnRectangleIcon, current: false },

]



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}



export default function LeftSidebar({profile}) {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.get("/api/logout/")

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


          <div class="col-span-1  rounded-lg bg-white shadow-sm ">
    <div class=" w-full items-center justify-between space-x-6 p-4">
                   <div  className="relative  lg:flex md:block items-center ">
              <div className="shrink-0">
                <img alt={profile.full_name || profile.username} src={profile.image || "/default.png"} className="h-12 w-12 rounded-full"/>
              </div>
              <div className="min-w-0 flex-1 ml-2">
                <p className="text-sm font-medium">{capitalizeFirstLetter(profile.full_name?profile.full_name:profile.username)}</p>
                <p className="truncate text-sm text-gray-400">
                  {profile.role || "Software developer"}
                </p>
              </div>
              
            </div>
      
    </div>
    <div>
      <div class=" flex py-2 ">
        <div class="cursor-pointer flex-1 hover:bg-green-500/20 min-w-0 rounded-lg">
          <p class="flex font-medium items-center justify-center text-sm">0</p>
          <p class="flex font-medium items-center justify-center text-sm text-[0.625rem]">Followers</p></div>
        <div class="cursor-pointer flex-1 hover:bg-green-500/20 min-w-0 rounded-lg">
          <p class="flex font-medium items-center justify-center text-sm">0</p>
          <p class="flex font-medium items-center justify-center text-sm text-[0.625rem]">Following</p>
        </div>
          <div class="cursor-pointer flex-1 hover:bg-green-500/20 min-w-0 rounded-lg">
          <p class="flex font-medium items-center justify-center text-sm">0</p>
          <p class="flex font-medium items-center justify-center text-sm text-[0.625rem]">Balance</p>
        </div>
      </div>
    </div>
  </div>
        {/* {profile.map((profile) => ( */}
          {/* <li key={profile.email} className="col-span-1 flex flex-col divide-y divide-white/10 rounded-lg outline -outline-offset-1 outline-white/10"> */}
            {/* <div className="flex flex-1 flex-col p-8">
              <img alt="No profile found" src={profile.image} className="mx-auto size-32 shrink-0 rounded-full bg-gray-700 outline -outline-offset-1 outline-white/10"
              />
              <h3 className="mt-6 text-sm font-medium">{capitalizeFirstLetter(profile.full_name?profile.full_name:profile.username)}</h3>
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
            </div> */}

             {/* <div  className="relative bg-white shadow rounded-lg lg:flex md:block items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2">
              <div className="shrink-0">
                <img alt={profile.full_name || profile.username} src={profile.image || "/default.png"} className="h-12 w-12 rounded-full"/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{capitalizeFirstLetter(profile.full_name?profile.full_name:profile.username)}</p>
                <p className="truncate text-sm text-gray-400">
                  {profile.role || "Software developer"}
                </p>
              </div>
              
            </div> */}
        
          {/* </li> */}
        {/* ))} */}
    
      </div>



      <div className="bg-white shadow rounded-lg mt-2 p-6">
  


 <div className="relative flex grow flex-col gap-y-5 ">
   


<nav className="relative flex flex-1 flex-col">
  <ul role="list" className="flex flex-1 flex-col gap-y-7">
    <li>
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <li key={item.name}>
              {item.name === "Logout" ? (
                /* LOGOUT BUTTON */
                <button
                  onClick={handleLogout}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-red-500 hover:bg-red-500/20"
                >
                  <item.icon className="size-6 shrink-0 text-red-500" />
                  Logout
                </button>
              ) : (
                /* NAV LINKS */
                <Link to={item.href}
                  className={classNames(
                    "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition",
                    isActive
                      ? "bg-green-500/20 text-green-600"
                      : "hover:bg-green-500/20 text-gray-700"
                  )}>
                  <item.icon
                    className={classNames(
                      "size-6 shrink-0",
                      isActive ? "text-green-600" : ""
                    )}
                  />
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  </ul>
</nav>

          </div>

      </div>

         


    </div>

    
  );
}
