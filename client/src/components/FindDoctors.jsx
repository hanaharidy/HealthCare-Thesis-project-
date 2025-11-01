import React, { useState, useEffect } from 'react';

const FindDoctors = () => {
  const [practitioners, setPractitioners] = useState([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  const fetchAllDoctors = async () => {
    try {
      const res = await fetch('http://localhost:8000/users/all-practitioners', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch practitioners');
      }

      const data = await res.json();
      setPractitioners(data);
      setFilteredPractitioners(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    const filtered = practitioners.filter((practitioner) =>
      practitioner.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
      practitioner.profession.toLowerCase().includes(e.target.value.toLowerCase()) ||
      practitioner.location.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPractitioners(filtered);
  };

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  return (
    <>
      {/* Top Banner */}
      <div
        className="w-full h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: "url('https://media.istockphoto.com/id/1023224308/photo/healthcare-and-medical-concept-medicine-doctor-with-stethoscope-in-hand-and-patients-come-to.jpg?s=612x612&w=0&k=20&c=aDeNkeXDO5DJEHXRDgngLUGrZdLwUW45XYDM-nuanT0=')", // <- Replace with your banner path
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center">
          <h1 className="text-white text-3xl sm:text-4xl font-bold">Our Experienced Doctors</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Input */}
          <div className="w-full max-w-xl mx-auto mb-8">
            <input
              id="q"
              name="q"
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search by name, profession, or location"
              type="search"
              value={searchValue}
              onChange={handleSearch}
            />
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPractitioners.length > 0 ? (
              filteredPractitioners.map((practitioner) => (
                <div
                  key={practitioner._id}
                  onClick={() => window.location.replace(`/profile/${practitioner._id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-200"
                >
                  <img
                    className="w-full h-48 object-cover"
                    src={
                      practitioner.profileImage ||
                      'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                    }
                    alt="Doctor"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">{practitioner.name}</h3>
                    <p className="text-sm text-indigo-600">{practitioner.profession}</p>
                    <p className="text-sm text-gray-500">{practitioner.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-500">
                No practitioners found.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FindDoctors;
