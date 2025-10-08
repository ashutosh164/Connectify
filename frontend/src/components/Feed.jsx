import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../AuthContext";
import api from "../api";
import Post from "./Post";
import CreatePost from "./CreatePost";

export default function Feed({profile}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const feedContainerRef = useRef(null);


  const fetchPosts = async (pageNum = 1, append = false, fetchAll = false) => {
  if (loading) return;
  setLoading(true);

  try {
    let url = `/posts/?page=${pageNum}`;
    let allPosts = [];
    let response = null;

    do {
      response = await api.get(url, {
        headers: { Authorization: `Token ${user.token}` },
      });
      const newPosts = response.data.results || [];
      allPosts = [...allPosts, ...newPosts];
      url = fetchAll && response.data.next ? response.data.next : null;
    } while (fetchAll && url);

    if (fetchAll) {
      setPosts(allPosts);
      setHasMore(false); // all loaded
    } else {
      setPosts(prev => (append ? [...prev, ...response.data.results] : response.data.results));
      setHasMore(Boolean(response.data.next));
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
  } finally {
    setLoading(false);
  }
};


  // Initial fetch
  useEffect(() => {
    fetchPosts(1, false);
  }, []);


  const handleAddRepost = (newPost) => {
  setPosts((prevPosts) => [newPost, ...prevPosts]);
};



  // Scroll handler (stable with useCallback)
  const handleScroll = useCallback(() => {
    const div = feedContainerRef.current;
    if (!div || loading || !hasMore) return;

    if (div.scrollTop + div.clientHeight >= div.scrollHeight - 5) {
      // ✅ only trigger once
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [loading, hasMore, page]);

  // Attach scroll listener once
  useEffect(() => {
    const div = feedContainerRef.current;
    if (!div) return;

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  

  return (
    <div className="flex-1 p-4 overflow-y-auto" ref={feedContainerRef} style={{ maxHeight: "calc(100vh - 56px)" }}>
      {/* Create Post Section */}
      <CreatePost profile={profile} user={user} onPostCreated={() => fetchPosts(page, false)} />

      {/* Posts Feed */}
      {posts.map((post) => (
        <Post   handleAddRepost={handleAddRepost}
 setPosts={setPosts} profile={profile} key={post.id} post={post} user={user} pageNum={page}
          // fetchPosts={() => fetchPosts(page, false)}
          fetchPosts={fetchPosts}/>))}

      {/* Loader */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {!hasMore && <p className="text-center text-gray-400">No more posts</p>}
    </div>
  );
}
