import React, { useState, useRef, useEffect } from "react";
import { HandThumbUpIcon, ChatBubbleLeftIcon, ArrowPathRoundedSquareIcon, PaperAirplaneIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import api from "../api";
import { capitalizeFirstLetter } from "../utiles/stringUtils";
import { formatDate } from "../utiles/dateUtils";

export default function Post({ post, user,pageNum, fetchPosts, profile }) {
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);

  const commentRef = useRef(null); // ref for comment section

  const toggleComments = () => setOpenComments(!openComments);

  const handleLike = () => {
    console.log('pagenumber',pageNum)
    const formData = new FormData();
    formData.append("post", post.id);
    formData.append("user", user.user_id);

    api.post("/like/", formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    })
    // .then(() => fetchPosts());
    .then(() => fetchPosts(1, false, true));
    

  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append("post", post.id);
    formData.append("user", user.user_id);
    formData.append("body", newComment);

    api.post("/comment/", formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    }).then(() => {
      setNewComment(""); // clear input
      fetchPosts(1, false, true); // refresh comments
    });
  };

  // Close comment section when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setOpenComments(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    
    <div className="bg-white shadow p-4 rounded-lg mb-4">
      <div className="flex items-center gap-4">
        <img src={post.author_profile?.image} className="h-12 w-12 rounded-full" alt="" />
        <div>
          <h3 className="text-sm font-medium">{capitalizeFirstLetter(post.user_name)}</h3>
          <p className="text-xs text-gray-400">{formatDate(post.created_on)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="mt-3">{post.title}</p>
      {post.image && <img src={post.image} alt="post" className="mt-2 rounded-lg max-h-80 w-full object-cover" />}

      {/* Actions */}
      <div className="flex justify-between mt-5 text-sm text-gray-600">
        <button onClick={handleLike} className={`text-[0.625rem] flex items-center gap-1 ${
    post.cehck_current_user_like_the_post ? "text-green-500 font-semibold" : ""
  }`}>
          <HandThumbUpIcon className="h-5 w-5" /> Like {post.total_like}
        </button>
        <button onClick={toggleComments} className={`text-[0.625rem] flex items-center gap-1 ${post.user_commented ? "text-green-500 font-semibold" : ""}`}>
          <ChatBubbleLeftIcon className="h-5 w-5" /> Comment {post.total_comment}
        </button>
        <button className="text-[0.625rem] flex items-center gap-1">
          <ArrowPathRoundedSquareIcon className="h-5 w-5" /> Repost
        </button>
        <button className="text-[0.625rem] flex items-center gap-1">
          <PaperAirplaneIcon className="h-5 w-5" /> Send
        </button>
      </div>

      {/* Comment Section */}
      {openComments && (
        <div ref={commentRef} className="mt-4 border-t border-green-500 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <img src={profile.image} className="h-8 w-8 rounded-full" alt="" />
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-full px-3 py-1 text-sm"/>
            <button onClick={handleAddComment} className="rounded-full text-green-500 font-bold cursor-pointer ">Post</button>
          </div>

          {/* Existing comments */}
          <div className="space-y-2">
            {post.comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <img src={c.profile_image} className="h-8 w-8 rounded-full" alt="" />
                <div className="bg-green-500/10 px-3 py-1 rounded-lg text-sm w-full">
                  <p className="font-medium">{c.user}</p>
                  <p>{c.body}</p>
                  <span className="text-gray-400 text-[0.625rem]">{new Date(c.created_on).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


