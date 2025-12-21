// import { UsersIcon } from "@heroicons/react/24/solid";

// export default function Header({ onNavigate }) {
//   return (
//     <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-md flex items-center justify-between px-6 z-50">
//       <h1 className="text-xl font-bold text-green-500">Connectify</h1>

//       <input
//         type="text"
//         placeholder="Search..."
//         className="ml-6 px-3 py-1 border rounded-2xl flex-1 max-w-md"
//       />

//       <button
//         onClick={() => onNavigate("network")}
//         className="ml-4 flex items-center gap-1 text-gray-700 hover:text-green-600 transition"
//       >
//         <UsersIcon className="w-6 h-6" />
//         <span className="hidden sm:inline text-sm font-medium">My Network</span>
//       </button>
//     </header>
//   );
// }


import { Link } from "react-router-dom";
import { UsersIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-md flex items-center justify-between px-6 z-50">
      <Link to="/" className="text-xl font-bold text-green-500">
          {/* <link rel="icon" type="image/png" href="/connectifys.png" /> */}
                  <img src='connectifys.png' className="h-10 w-10" alt="imge not found" />


      </Link>     
      {/* <input type="text" placeholder="Search..."className="ml-6 px-3 py-1 border rounded-2xl flex-1 max-w-md"/> */}

      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition" >
          <HomeIcon className="w-6 h-6" />
          <span className="hidden sm:inline text-sm font-medium">Home</span>
        </Link>

        <Link to="/my-network" className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition">
          <UsersIcon className="w-6 h-6" />
          <span className="hidden sm:inline text-sm font-medium">My Network</span>
        </Link>
              {/* <Link to="/chat" className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition">
          <span className="hidden sm:inline text-sm font-medium">Chat</span>
        </Link> */}
      </div>
    </header>
  );
}
