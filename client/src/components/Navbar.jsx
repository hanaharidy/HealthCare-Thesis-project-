import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import Authentication from './Authentication';
import { FiMail, FiPhone, FiClock } from 'react-icons/fi';

const Navbar = () => {
  const { currentUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
  };

  return (
    <div className="Navbar-container">
      {/* Top bar */}
      <div className="bg-blue-100 text-md text-gray-700 flex justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <FiClock className="text-blue-600" />
          Opening Hours: Mon - Fri: 6.00 am -10.00 pm,  Sunday: Closed
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FiMail className="text-blue-600" />
            mail@domain.com
          </div>
          <div className="flex items-center gap-1">
            <FiPhone className="text-blue-600" />
            +012 345 6789
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className="bg-gray-40 shadow-md py-4 px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl">
          <span className="text-3xl">🩺</span>
          HealthCare
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-gray-800 font-medium">
          <a href="#" className="hover:text-blue-600 transition">Home</a>
          <a href="#" className="hover:text-blue-600 transition">About</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>

          {!currentUser ? (
            <>
              <button
                className="px-4 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-100"
                onClick={() => openModal('login')}
              >
                Login
              </button>
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => openModal('signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
          )}
        </nav>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <Authentication modalType={modalType} closeModal={closeModal} />
      )}
    </div>
  );
};

export default Navbar;
