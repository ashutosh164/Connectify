import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import api from "../api";

export default function CreatePost({ user, onPostCreated, profile }) {
  const [open, setOpen] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = () => {
    if (!newPost.trim() && !image) return;

    const formData = new FormData();
    formData.append("title", newPost);
    formData.append("author", user.user_id);

    if (image) formData.append("image", image);

    api.post("/api/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Token ${user.token}` },
    }).then(() => {
      setNewPost("");
      setImage(null);
      setOpen(false);
      onPostCreated(); // refresh feed in parent
    });
  };

  return (
    <>
      {/* Start Post Input */}
      <div className="bg-white shadow p-4 rounded-lg mb-4">
        <div className="flex w-full items-center space-x-4">
          <img alt="" src={profile.image || "https://via.placeholder.com/32"} className="h-12 w-12 rounded-full"/>
          <input type="text" placeholder="Start a post" className="w-full border rounded-2xl p-2 cursor-pointer" readOnly onClick={() => setOpen(true)}/>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-900/50 transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 ">
            <DialogPanel className="relative transform overflow-hidden border rounded-lg bg-white px-6 py-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <DialogTitle className="text-lg font-semibold">Create a Post</DialogTitle>

              {/* Textarea */}
              <textarea
                className="mt-3 w-full rounded-md bg-white p-2 border outline-none"
                rows="4"
                placeholder="What do you want to talk about?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />

              {/* Image input */}
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="block w-full text-sm text-gray-300
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-green-500 file:text-white
                             hover:file:bg-green-400"
                />
              </div>

              {/* Preview image */}
              {image && (
                <div className="mt-3">
                  <img src={URL.createObjectURL(image)} alt="preview" className="max-h-48 rounded-lg" />
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Post
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
