import React, { useState, useRef, useEffect } from "react";
import {
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  ArrowPathRoundedSquareIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import api from "../api";
import { capitalizeFirstLetter } from "../utiles/stringUtils";
import { formatDate } from "../utiles/dateUtils";

export default function Post({ post, user, setPosts,handleAddRepost }) {
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [likeStatus, setLikeStatus] = useState({
    isLiked: post.cehck_current_user_like_the_post,
    count: post.total_like,
  });
  const [commentCount, setCommentCount] = useState(post.total_comment);
  const [repostCount, setRepostCount] = useState(post.total_repost || 0);

  const commentRef = useRef(null);

  // Toggle comment section
  const toggleComments = () => setOpenComments(!openComments);

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const formData = new FormData();
      formData.append("post", post.id);
      formData.append("user", user.user_id);

      const res = await api.post("/like/", formData, {
        headers: { Authorization: `Token ${user.token}` },
      });

      const action = res.data.action; // assume backend returns "liked" or "unliked"
      setLikeStatus((prev) => ({
        isLiked: action === "liked",
        count: action === "liked" ? prev.count + 1 : prev.count - 1,
      }));

      // Update parent posts array
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                total_like: action === "liked" ? prev.count + 1 : prev.count - 1,
                cehck_current_user_like_the_post: action === "liked",
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const formData = new FormData();
      formData.append("post", post.id);
      formData.append("user", user.user_id);
      formData.append("body", newComment);

      const res = await api.post("/comment/", formData, {
        headers: { Authorization: `Token ${user.token}` },
      });

      setComments((prev) => [...prev, res.data]); // append new comment
      setCommentCount((prev) => prev + 1); // increase comment count
      setNewComment("");

      // Update parent posts array
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, total_comment: p.total_comment + 1, user_commented: true }
            : p
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comment/${commentId}/`, {
        headers: { Authorization: `Token ${user.token}` },
      });

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => Math.max(prev - 1, 0));

      // Update parent posts array
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, total_comment: Math.max(p.total_comment - 1, 0) }
            : p
        )
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Handle repost
const [reposted, setReposted] = useState(post.cehck_current_user_repost || false);

const handleRepost = async () => {
  try {
    const res = await api.post(`/posts/${post.id}/repost/`, null, {
      headers: { Authorization: `Token ${user.token}` },
    });

    // Update repost count
    setReposted(true); 
    setRepostCount(res.data.total_repost);

    if (res.data.repost_post && handleAddRepost) {
      handleAddRepost(res.data.repost_post); // insert at top immediately
    }

    // Update parent posts array (insert new repost at top)
    const newPost = res.data.repost_post; // backend should return the reposted post object
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    }

  } catch (err) {
    console.error("Error reposting:", err);
  }
};


  // Close comment modal on outside click
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
      {/* Post Header */}
      <div className="flex items-center gap-4">
        <img src={post.author_profile?.image || "/default.png"} className="h-12 w-12 rounded-full" alt="" />
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
        <button
          onClick={handleLike}
          className={`text-[0.625rem] flex items-center gap-1 ${likeStatus.isLiked ? "text-green-500 font-semibold" : ""}`}
        >
          <HandThumbUpIcon className="h-5 w-5" /> Like {likeStatus.count}
        </button>

        <button
          onClick={toggleComments}
          className={`text-[0.625rem] flex items-center gap-1 ${comments.some(c => c.user === user.user_id) ? "text-green-500 font-semibold" : ""}`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5" /> Comment {commentCount}
        </button>

        <button
        onClick={handleRepost}
        className={`text-[0.625rem] flex items-center gap-1 ${
            reposted ? "text-green-500 font-semibold" : ""
        }`}
        >
        <ArrowPathRoundedSquareIcon className="h-5 w-5" /> Repost {repostCount}
        </button>

        <button className="text-[0.625rem] flex items-center gap-1">
          <PaperAirplaneIcon className="h-5 w-5" /> Send
        </button>
      </div>

      {/* Comment Section */}
      {openComments && (
        <div ref={commentRef} className="mt-4 border-t border-green-500 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <img src={user.profile_image || "/default.png"} className="h-8 w-8 rounded-full" alt="" />
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-full px-3 py-1 text-sm"
            />
            <button onClick={handleAddComment} className="rounded-full text-green-500 font-bold cursor-pointer">Post</button>
          </div>

          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <img src={c.profile_image || "/default.png"} className="h-8 w-8 rounded-full" alt="" />
                <div className="bg-green-500/10 px-3 py-1 rounded-lg text-sm w-full">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-sm">{c.user_name}</p>
                      <p className="font-medium text-[0.625rem] text-gray-500">{c.user_role || "Software developer"}</p>
                    </div>
                    {user.user_id === c.user && (
                      <span>
                        <TrashIcon
                          onClick={() => handleDeleteComment(c.id)}
                          className="h-4 w-4 cursor-pointer text-red-500"
                        />
                      </span>
                    )}
                  </div>
                  <p className="mt-1">{c.body}</p>
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
