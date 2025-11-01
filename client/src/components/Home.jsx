import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Inquiry from './Inquiry';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [inquiries, setInquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newInquiry, setNewInquiry] = useState('');
  const { currentUser } = useContext(UserContext);

  const navigate = useNavigate()

  // Fetch all inquiries
  const getInquiries = async () => {
    try {
      const res = await fetch('http://localhost:8000/inquiry/all-inquiries', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      const data = await res.json();
      console.log("Fetched data:", data);
  
      if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        console.error("Expected array but got:", data);
        setInquiries([]); // fallback to empty array to avoid map crash
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]); // fallback in case of fetch error
    }
  };
  

  // Add a new inquiry
  const submitInquiry = async () => {
    if (!newInquiry.trim()) {
      alert('Inquiry text cannot be empty.');
      return;
    }

    const res = await fetch('http://localhost:8000/inquiry/add-inquiry', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.id,
        inquiry: newInquiry,
      }),
    });

    if (res.ok) {
      const addedInquiry = await res.json();
      setInquiries((prev) => [...prev, addedInquiry]);
      setNewInquiry('');
      setShowModal(false);
    } else {
      alert('Failed to add inquiry. Please try again.');
    }
  };

  useEffect(() => {
    getInquiries();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar />
  
      {/* Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
  
        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {currentUser && currentUser?.role === 'Patient' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 px-3 py-1 rounded text-white"
            >
              Add Inquiry +
            </button>
          )}
  
          {inquiries.map((i) => (
            <div
              key={i._id}
              className="mt-4 cursor-pointer"
              onClick={() => navigate(`/inquiry/${i._id}`)}
            >
              <Inquiry
                name={i.name}
                inquiry={i.inquiry}
                datetime={i.createdAt.split('T')[0]}
              />
            </div>
          ))}
        </main>
      </div>
  
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add Inquiry</h2>
            <textarea
              value={newInquiry}
              onChange={(e) => setNewInquiry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="4"
              placeholder="Type your inquiry here..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitInquiry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Home;
