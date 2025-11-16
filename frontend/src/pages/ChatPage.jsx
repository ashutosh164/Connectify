// src/pages/ChatPage.jsx
import React from "react";
import Chat from "../components/Chat";

/**
 * Example usage:
 * - conversationId: from route or props
 * - currentUser: username or id (used to align messages)
 */
export default function ChatPage({ conversationId, currentUser }) {
  // conversationId can be taken from route params in your router
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <Chat conversationId={conversationId || 1} currentUser={currentUser || "alice"} />
    </div>
  );
}
