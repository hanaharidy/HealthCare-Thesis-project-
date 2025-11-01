import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const Authentication = ({ modalType, closeModal }) => {
  const { signIn } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Patient',
    age: '',
    gender: '',
    contact: '',
    birth: '',
    profession: '',
    yearsExperience: '',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // For login
      if (modalType === 'login') {
        const res = await fetch(`http://localhost:8000/users/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        
        signIn(data.user, data.token);
        closeModal();
        return;
      }

      // For signup
      const submissionData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        contact: formData.contact,
        role: formData.role,
        ...(formData.role === 'Patient' ? {
          age: Number(formData.age),
          gender: formData.gender,
          birth: formData.birth || null
        } : {
          profession: formData.profession,
          yearsExperience: Number(formData.yearsExperience),
          location: formData.location
        })
      };

      // Validate required fields
      if (formData.role === 'Patient' && !formData.gender) {
        throw new Error('Please select a gender');
      }

      const res = await fetch(`http://localhost:8000/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed. Please check all fields');
      }

      // Auto-login after successful signup
      const loginRes = await fetch(`http://localhost:8000/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error('Account created but login failed');

      signIn(loginData.user, loginData.token);
      closeModal();
      alert(`Welcome ${loginData.user.name}!`);

    } catch (err) {
      console.error('Authentication Error:', {
        error: err,
        formData: formData
      });
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">
          {modalType === 'login' ? 'Log In' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            className="w-full p-2 border border-gray-300 rounded"
          />

          {modalType === 'signup' && (
            <>
              {/* Signup specific fields */}
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Patient">Patient</option>
                <option value="Practitioner">Practitioner</option>
              </select>

              {/* Patient-specific fields */}
              {formData.role === 'Patient' && (
                <>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="date"
                    name="birth"
                    value={formData.birth}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </>
              )}

              {/* Practitioner-specific fields */}
              {formData.role === 'Practitioner' && (
                <>
                  <input
                    type="text"
                    name="profession"
                    placeholder="Profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    name="yearsExperience"
                    placeholder="Years of Experience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </>
              )}

              <input
                type="tel"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {modalType === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Authentication;