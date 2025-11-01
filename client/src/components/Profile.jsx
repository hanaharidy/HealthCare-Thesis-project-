import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Calendar from "./Calendar";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [newDates, setNewDates] = useState([]);
  const [calendarMode, setCalendarMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);

  const userId = window.location.pathname.split("/")[2];
  const { currentUser } = useContext(UserContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddMedicalHistory = async () => {
    if (!title || !description || !file) {
      alert("All fields are required.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `medical-history/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const mediaUrl = await getDownloadURL(storageRef);

      const res = await fetch(`http://localhost:8000/history/add-history/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          media: mediaUrl,
          description,
        }),
      });

      if (res.ok) {
        alert("Medical history added successfully.");
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setFile(null);
      } else {
        alert("Failed to add medical history.");
      }
    } catch (err) {
      console.error("Error uploading medical history:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:8000/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user data");

      const data = await res.json();
      setUser(data);
      setSelectedStars(data.averageRating || 0);
      setAvailableDates(data.availableDays || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDates = async () => {
    try {
      const res = await fetch(`http://localhost:8000/users/add-available-dates/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dates: newDates }),
      });

      if (!res.ok) throw new Error("Failed to add dates");

      const updatedUser = await res.json();
      setAvailableDates(updatedUser.availableDays);
      setNewDates([]);
      setCalendarMode("view");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReserveDate = async (date) => {
    if (currentUser?.role !== "Patient") {
      alert("Only Patients Can Reserve a Date");
      return;
    }

    try {
      date = date.split('T')[0];
      const res = await fetch(`http://localhost:8000/users/reserve-date/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      if (!res.ok) alert("Failed to reserve date");

      const updatedUser = await res.json();
      setAvailableDates(updatedUser.availableDays);
      alert("Date reserved successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRating = async (value) => {
    if (currentUser?.id === userId || currentUser?.role === "Practitioner") {
      alert("Cannot rate yourself or other practitioners");
      return;
    }

    setSelectedStars(value);
    try {
      const response = await fetch(`http://localhost:8000/users/rate-practitioner/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: currentUser.id,
          value: value
        })
      });
      console.log('Rating submitted:', response.data);
    } catch (error) {
      console.error('Error rating practitioner:', error);
    }
  };

  const toggleCalendarMode = () => {
    setCalendarMode(prevMode => (prevMode === "view" ? "edit" : "view"));
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderMedia = (mediaUrl) => {
    const media = mediaUrl.toLowerCase();
    if (media.match(/\.(jpg|jpeg|png|gif)$/)) {
      return <img src={mediaUrl} alt="Medical History Media" className="max-w-full h-auto rounded" />;
    } else if (media.match(/\.(mp4|webm|ogg)$/)) {
      return (
        <video controls className="max-w-full rounded">
          <source src={mediaUrl} type={`video/${media.split('.').pop()}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (media.includes(".pdf")) {
      return (
        <iframe
          src={mediaUrl}
          className="w-full h-96 border rounded"
          title="Medical History PDF"
        ></iframe>
      );
    }
    return (
      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        View File
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('https://media.istockphoto.com/id/475650728/vector/vector-background-health-care-concept-template.jpg?s=612x612&w=0&k=20&c=6-ZKJUudXOJQtFk-Q06Nh8G81xcS1rGYno4nMXSkbuo=')"
      }}>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-4 sm:grid-cols-12 gap-6 px-4">
          {/* Profile Section */}
          <div className="col-span-4 sm:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col items-center">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  alt="Profile"
                  className="w-32 h-32 bg-gray-300 rounded-full mb-4 shrink-0"
                />
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-gray-700">{user.contact}</p>
                {user.gender && <p className="text-gray-700">Gender: {user.gender}</p>}
              </div>
            </div>
          </div>

          {/* Role-Specific Details Section */}
          <div className="col-span-4 sm:col-span-9">
            <div className="bg-white shadow rounded-lg p-6">
              {user.role === "Patient" && (
                <>
                  <h2 className="text-xl font-bold mb-4">Patient Details</h2>
                  <p className="text-gray-700">Age: {user.age}</p>
                  <p className="text-gray-700">
                    Birthdate: {new Date(user.birth).toLocaleDateString()}
                  </p>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Medical History</h3>
                  {user.history?.length > 0 ? (
                    user.history.map((history, index) => (
                      <div key={index} className="mb-4 bg-white p-4 shadow rounded-lg">
                        <h2 className="font-bold text-lg mb-2">{history?.title}</h2>
                        <div className="media-container mb-4">
                          {history?.media && renderMedia(history.media)}
                        </div>
                        <p className="text-gray-700">{history?.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No medical history available.</p>
                  )}
                  <div className="mt-6">
                    <button
                      className="bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Add Medical History
                    </button>
                  </div>
                </>
              )}

              {user.role === "Practitioner" && (
                <>
                  <h2 className="text-xl font-bold mb-4">Practitioner Details</h2>
                  <p className="text-gray-700">Profession: {user.profession}</p>
                  <p className="text-gray-700">Years of Experience: {user.yearsExperience}</p>
                  <p className="text-gray-700">Location: {user.location}</p>
                  <p className="text-gray-700">Average Rating: {user.averageRating}</p>
                  
                  <div className="flex space-x-2 my-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={star <= selectedStars ? 'yellow' : 'gray'}
                        className="w-8 h-8 cursor-pointer"
                        onClick={() => handleRating(star)}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.974-2.89a1 1 0 00-1.176 0l-3.974 2.89c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.48 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.518-4.674z" />
                      </svg>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-2">Available Dates</h3>
                  <Calendar
                    days={availableDates}
                    timeSlots={["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"]}
                    mode={calendarMode}
                    onAddDate={(date) => setNewDates((prev) => [...prev, date])}
                    onReserveDate={handleReserveDate}
                  />

                  {currentUser?.id === userId && (
                    <div className="mt-4">
                      {calendarMode === "edit" && (
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">Add New Date:</label>
                          <input
                            type="date"
                            onChange={(e) => setNewDates((prev) => [...prev, e.target.value])}
                            className="block w-full p-2 border border-gray-300 rounded"
                          />
                          {newDates.length > 0 && (
                            <ul className="mt-2">
                              {newDates.map((date, idx) => (
                                <li key={idx} className="text-gray-600">
                                  {new Date(date).toLocaleDateString()}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <button
                        onClick={toggleCalendarMode}
                        className="bg-indigo-600 text-white py-2 px-4 rounded shadow hover:bg-indigo-700"
                      >
                        {calendarMode === "view" ? "Edit Available Dates" : "Save Changes"}
                      </button>
                      {calendarMode === "edit" && (
                        <button
                          onClick={handleAddDates}
                          className="ml-4 bg-green-600 text-white py-2 px-4 rounded shadow hover:bg-green-700"
                        >
                          Save New Dates
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Adding Medical History */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Medical History</h2>

              <label className="block mb-2 font-medium">Title:</label>
              <input
                type="text"
                className="w-full border p-2 rounded mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Surgery Report"
              />

              <label className="block mb-2 font-medium">Description:</label>
              <textarea
                className="w-full border p-2 rounded mb-4"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., This report describes the procedure..."
              />

              <label className="block mb-2 font-medium">Upload File:</label>
              <input
                type="file"
                className="mb-4"
                onChange={handleFileChange}
              />

              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleAddMedicalHistory}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;