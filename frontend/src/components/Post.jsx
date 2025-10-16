import React, { useState, useRef, useEffect } from "react";
import { HandThumbUpIcon, ChatBubbleLeftIcon, ArrowPathRoundedSquareIcon, PaperAirplaneIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../api";
import { capitalizeFirstLetter } from "../utiles/stringUtils";
import { formatDate } from "../utiles/dateUtils";

export default function Post({ post, user,pageNum, fetchPosts, profile }) {
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);

  const commentRef = useRef(null); // ref for comment section

  const toggleComments = () => setOpenComments(!openComments);

//   const handleLike = () => {
//     console.log('pagenumber',pageNum)
//     const formData = new FormData();
//     formData.append("post", post.id);
//     formData.append("user", user.user_id);

//     api.post("/like/", formData, {
//       headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
//     })
//     // .then(() => fetchPosts());
//     .then(() =>{
//         //  fetchPosts(1, false, true)
//     });
    

//   };



 const [likeStatus, setLikeStatus] = useState({
    loading: false,
    isLiked: post.cehck_current_user_like_the_post,
    count: post.total_like,
  });

  // keep local state synced if parent supplies a new post prop
  useEffect(() => {
    setLikeStatus({
      loading: false,
      isLiked: post.cehck_current_user_like_the_post,
      count: post.total_like,
    });
  }, [post.cehck_current_user_like_the_post, post.total_like]);

  const handleLike = async () => {
    // prevent parallel requests
    if (likeStatus.loading) return;

    // snapshot previous values so we can revert on error
    const prevLiked = likeStatus.isLiked;
    const prevCount = likeStatus.count;

    // optimistic new values
    const willLike = !prevLiked;
    const optimisticCount = willLike ? prevCount + 1 : Math.max(0, prevCount - 1);

    // apply optimistic UI
    setLikeStatus({ loading: true, isLiked: willLike, count: optimisticCount });

    // prepare & send request
    const formData = new FormData();
    formData.append("post", post.id);
    formData.append("user", user.user_id);

    try {
      const res = await api.post("/like/", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
      });

      // Helpful: log response while debugging
      // console.log("like API response:", res.data);

      // Normalize server response to determine final state
      const action = res?.data?.action; // expected 'liked' or 'unliked' ideally
      const serverCount = typeof res?.data?.total_like === "number" ? res.data.total_like : null;

      let serverLiked;
      if (typeof action === "string") {
        serverLiked = action.toLowerCase() === "liked";
      } else if (typeof action === "boolean") {
        serverLiked = action;
      } else if (res?.data?.is_liked !== undefined) {
        serverLiked = !!res.data.is_liked;
      } else {
        // fallback: assume server applied the optimistic intent
        serverLiked = willLike;
      }

      // pick count: prefer server-provided count if present, otherwise derive from serverLiked & previous
      const finalCount = serverCount !== null
        ? Math.max(0, serverCount)
        : (serverLiked ? Math.max(optimisticCount, prevCount + (serverLiked && !prevLiked ? 1 : 0)) : Math.max(0, optimisticCount));

      setLikeStatus({ loading: false, isLiked: serverLiked, count: finalCount });
    } catch (err) {
      console.error("Error liking post:", err);
      // revert to previous stable state
      setLikeStatus({ loading: false, isLiked: prevLiked, count: prevCount });
    }
  };


//   const handleAddComment = () => {
//     if (!newComment.trim()) return;

//     const formData = new FormData();
//     formData.append("post", post.id);
//     formData.append("user", user.user_id);
//     formData.append("body", newComment);

//     api.post("/comment/", formData, {
//       headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
//     }).then(() => {
//       setNewComment(""); // clear input
//       fetchPosts(1, false, true); // refresh comments
//     });
//   };

  // Close comment section when clicking outside
 
 
 
//  const [openComments, setOpenComments] = useState(false);
//   const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [commentCount, setCommentCount] = useState(post.total_comment || 0);
    const [repostCount, setRepostCount] = useState(post.total_repost || 0);

  const [loading, setLoading] = useState(false);
  const [iscomment, isCommnet] = useState(false);
    const [isrepost, isRepost] = useState(false);


//   const commentRef = useRef(null);

//   const toggleComments = () => {
//     setOpenComments((prev) => !prev);
//   };

  const handleAddComment = async () => {
    if (!newComment.trim() || loading) return;

    // Create a temporary optimistic comment
    const tempComment = {
      id: `temp-${Date.now()}`,
      user: user.username || "You",
      profile_image: user.profile_image || "/default.png",
      body: newComment,
      created_on: new Date().toISOString(),
      isTemp: true,
    //   user_commented: 
    };

    // Optimistic UI update
    setComments((prev) => [tempComment, ...prev]);
    setCommentCount((prev) => prev + 1);
    setNewComment("");
    setLoading(true);

    const formData = new FormData();
    formData.append("post", post.id);
    formData.append("user", user.user_id);
    formData.append("body", tempComment.body);

    try {
      const res = await api.post("/comment/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${user.token}`,
        },
      });

      // Replace temp comment with the real one from server
      if (res?.data) {
        isCommnet(true)
        setComments((prev) =>
          prev.map((c) =>
            c.id === tempComment.id ? { ...res.data, isTemp: false } : c
          )
        );

        // If backend returns updated count
        if (typeof res.data.total_comment === "number") {
          setCommentCount(res.data.total_comment);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error adding comment:", err);

      // Remove temp comment & revert count
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setCommentCount((prev) => Math.max(0, prev - 1));

      setLoading(false);
    }
  };
 


const handleDeleteComment = async (commentId) => {
  try {
    await api.delete(`/comment/${commentId}/`, {
      headers: { Authorization: `Token ${user.token}` },
    });
    // remove the comment from local state instead of fetching all posts
    setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentCount((prev) => Math.max(prev - 1, 0));

    console.log('Comment deleted successfully');
  } catch (error) {
    console.error("Error deleting comment:", error);

  }
};


const handleRepost = async (postId) => {
  try {
    const res = await api.post(`/posts/${postId}/repost/`, null, {
      headers: { Authorization: `Token ${user.token}` },
    });

    // update UI instantly
    // setPosts(prev =>
    //   prev.map(post => post.id === postId
    //     ? { ...post, total_repost: res.data.total_repost }
    //     : post
    //   )
    // );
    setRepostCount((prev)=> prev + 1)
    isRepost(true)

    console.log("Reposted successfully");
  } catch (error) {
    console.error("Error reposting:", error);
        setRepostCount((prev) => Math.max(0, prev - 1));
  }
};

 
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
        {/* <button onClick={handleLike} className={`text-[0.625rem] flex items-center gap-1 ${
    post.cehck_current_user_like_the_post ? "text-green-500 font-semibold" : ""
  }`}>
          <HandThumbUpIcon className="h-5 w-5" /> Like {post.total_like}
        </button> */}

        <button onClick={handleLike} disabled={likeStatus.loading}className={`text-[0.625rem] flex items-center cursor-pointer gap-1 ${likeStatus.isLiked ? "text-green-500 font-semibold cursor-pointer" : ""} ${likeStatus.loading ? "opacity-60 cursor-not-allowed" : ""}`}>
        {likeStatus.loading ? (<div className="w-4 h-4 border-2 border-green-500 cursor-pointer border-t-transparent rounded-full animate-spin"></div>) : (<HandThumbUpIcon className="h-5 w-5" />)} Like {likeStatus.count}
      </button>



        <button onClick={toggleComments} className={`text-[0.625rem] flex items-center cursor-pointer gap-1 ${post.user_commented|| iscomment ? "text-green-500 font-semibold cursor-pointer" : ""}`}>
          <ChatBubbleLeftIcon className="h-5 w-5" /> Comment  {commentCount}
        </button>



        
        <button onClick={() => handleRepost(post.id)} className={`text-[0.625rem] flex items-center cursor-pointer gap-1 ${post.is_repost|| isrepost ? "text-green-500 font-semibold cursor-pointer" : ""}`}>
          <ArrowPathRoundedSquareIcon className="h-5 w-5" /> Repost {repostCount}
        </button>

        <button className="text-[0.625rem] flex items-center cursor-pointer gap-1">
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
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <img src={c.profile_image|| "/default.png"} className="h-8 w-8 rounded-full" alt="" />
                <div className="bg-green-500/10 px-3 py-1 rounded-lg text-sm w-full">
                <div className="flex justify-between">
                    <div>
                        <p className="font-bold text-sm ">{c.user_name}</p>
                        <p class="font-medium text-[0.625rem] text-gray-500">{c.user_role|| 'Software developer'}</p>
                    </div>
                    {user.user_id === c.user && (<span><TrashIcon onClick={() => handleDeleteComment(c.id)} className="h-4 w-4 cursor-pointer text-red-500"/></span>)}
                    
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


