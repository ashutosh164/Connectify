import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Network() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loader state

  const location = useLocation();

  useEffect(() => {
    getInviteList();
  }, [location.pathname]);

  function getInviteList() {
    setLoading(true); // ✅ Show loader before fetching

    api.get("/api/my-invite/", {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${user.token}`,
      },
    })
      .then((res) => {
        const data = res.data.data.map((p) => ({ ...p, accepted: false }));
        setProfiles(data);
      })
      .catch((err) => console.error("Error fetching profiles:", err))
      .finally(() => setLoading(false)); // ✅ Hide loader after fetch
  }

  const acceptConnection = async (senderId) => {
    const formData = new FormData();
    formData.append("profile_id", senderId);

    try {
      await api.post("/api/my-invite/accept/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === senderId ? { ...p, accepted: true } : p))
      );
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Failed to accept connection.");
    }
  };

  const rejectConnection = async (senderId) => {
    const formData = new FormData();
    formData.append("profile_id", senderId);

    try {
      await api.post("/api/my-invite/reject/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      });

      getInviteList();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      alert("Failed to reject connection.");
    }
  };

  return (
    <div>
      <div
        className="flex-1 p-4 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: "calc(100vh - 56px)" }}
      >
        <div className="bg-white shadow p-4 rounded-lg mb-4">
          <div className="flex w-full items-center space-x-4">
            <Link
              to="/my-network"
              onClick={() => getInviteList()} // ✅ Force refresh on click
              className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition"
            >
              <span className="text-sm font-medium cursor-pointer">
                my network
              </span>
            </Link>
              <Link to="/my" onClick={() => getInviteList()}  className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition"
            >
            <span className="text-sm font-medium cursor-pointer">my </span>
            </Link>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-5">
          People You May Know
        </h2>

        {/* ✅ Loader */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : profiles.length > 0 ? (
          profiles.map((person) => (
            <div
              key={person.id}
              className="relative bg-white shadow rounded-lg flex items-center space-x-3 border border-white/10 px-6 py-5 hover:border-white/25 mb-2"
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
                  {person.role || "Software Developer"}
                </p>
              </div>

              {!person.accepted ? (
                <div className="flex justify-between gap-2">
                  <div
                    onClick={() => acceptConnection(person.id)}
                    className="flex items-center cursor-pointer"
                  >
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20">
                      Accept
                    </span>
                  </div>

                  <div
                    onClick={() => rejectConnection(person.id)}
                    className="flex items-center cursor-pointer"
                  >
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20">
                      Reject
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-green-600 text-sm font-medium">
                  Connected
                </span>
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
