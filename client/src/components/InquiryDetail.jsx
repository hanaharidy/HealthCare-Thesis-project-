import React, { useState, useEffect, useContext } from "react";
import { UserContext } from '../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';


const InquiryDetail = () => {
  const [inquiry, setInquiry] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate()

  const {currentUser} = useContext(UserContext)


  const inquiryId = window.location.pathname.split('/')[2]
  

  // Fetch inquiry details
  const fetchInquiry = async () => {
    try {
      const res = await fetch(`http://localhost:8000/inquiry/${inquiryId}`);
      if (!res.ok) throw new Error("Failed to fetch inquiry");

      const data = await res.json();
      setInquiry(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a comment
  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/inquiry/add-comment/${inquiryId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            practitionerId: currentUser.id,
            text: comment,
          }),
        }
      );

      if (!res.ok) alert("Failed to add comment");
      if(res.ok)
        window.location.reload()

      //const updatedInquiry = await res.json();
      //setInquiry(updatedInquiry);
      setComment("");
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    
    fetchInquiry();
  }, [inquiryId]);

  if (loading) return <p>Loading...</p>;
  
  if (error) return <p>Error: {error}</p>;

  console.log(inquiry.inquiry.comments)

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md border p-4">
        {/* Inquiry Details */}
        <div className="flex items-center mb-4">
          <img
            className="w-12 h-12 rounded-full mr-3 cursor-pointer"
            onClick={()=>navigate(`/profile/${inquiry.inquiry.userId}`)}
            src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
            alt="Profile Image"
          />
          <div>
            <h2 className="text-lg font-semibold">{inquiry.name}</h2>
            <p className="text-gray-500 text-sm">
              Published on {new Date(inquiry.inquiry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-gray-700 mb-4">{inquiry.inquiry.inquiry}</p>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">Comments</h3>
        <div className="space-y-4">
          {inquiry?.inquiry?.comments.length > 0 ? (
            inquiry?.inquiry?.comments.map((comment, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md p-4 border cursor-pointer"
                onClick={()=>navigate(`/profile/${comment.practitionerId}`)}
              >
                <div className="flex items-center mb-2">
                  <img
                    className="w-10 h-10 rounded-full mr-3"
                    src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    alt="Profile Image"
                  />
                  <div>
                    <h4 className="text-md font-semibold">
                      Practitioner {comment.practitionerName}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Add Comment Section */}
        {currentUser.role === "Practitioner" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Add a Comment</h3>
            <textarea
              className="w-full p-3 border rounded mb-4"
              rows="4"
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              onClick={handleAddComment}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryDetail;
