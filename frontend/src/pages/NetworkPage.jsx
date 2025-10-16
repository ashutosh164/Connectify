import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Network() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    api
      .get("/my-invite/", {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      })
      .then((res) => {
        console.log("invite_profile_list_view====>>", res);
        // Add accepted flag to each profile
        const data = res.data.data.map((p) => ({ ...p, accepted: false }));
        setProfiles(data);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  const acceptConnection = async (senderId) => {
    const formData = new FormData();
    formData.append("profile_id", senderId);

    try {
      await api.post("/my-invite/accept/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      });

      // ✅ Mark that profile as accepted instead of removing
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === senderId ? { ...p, accepted: true } : p
        )
      );
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Failed to accept connection.");
    }
  };

  return (
    <div
      className="flex-1 p-4 overflow-y-auto custom-scrollbar"
      style={{ maxHeight: "calc(100vh - 56px)" }}
    >
      <h2 className="text-xl font-bold text-gray-700 mb-5">
        People You May Know
      </h2>

      {profiles && profiles.length > 0 ? (
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

            {/* ✅ Hide or replace Accept after success */}
            {!person.accepted ? (
              <div
                onClick={() => acceptConnection(person.id)}
                className="flex items-center cursor-pointer space-x-2"
              >
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20">
                  Accept
                </span>
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
  );
}
