import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { currentUser, signOut } = useContext(UserContext);
  const navigate = useNavigate();

  // Log the user object to debug
  console.log("User:", currentUser);

  // Define elements based on user.role, with a fallback
  const elements =
  currentUser?.role === 'Patient'
      ? ['Find Doctor', 'Chats', 'Profile', 'Add Inquiry']
      : currentUser?.role === 'Practitioner'
      ? ['Chats', 'Profile', 'Appointments']
      : [];

  // Add "Sign Out" only if the user is logged in
  if (currentUser) {
    elements.push('Sign Out');
  }

  // Log elements to debug
  console.log("Elements:", elements);

  const handleSelect = (elem) => {
    console.log(elem);

    // Perform navigation or other actions based on `elem`
    if(elem === "Profile")
      navigate(`/profile/${currentUser?.id}`)

    if(elem === "Find Doctor")
      navigate('/find-doctor')

    if (elem === 'Sign Out') {
      signOut();
    }

  };

  return (
    <div>
      <aside
  className="w-64 h-full bg-blue-900 overflow-y-auto"
  aria-label="Sidebar"
>
        <div className="h-full px-3 py-20 overflow-y-auto bg-blue-900 dark:bg-blue-900">
          {elements.length > 0 ? (
            <ul className="space-y-2 font-medium">
              {elements.map((elem, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(elem)}
                    className="w-full flex items-center text-center font-bold p-2  text-black rounded-lg bg-blue-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {elem}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
<p className="text-white font-bold text-lg text-center">No options available</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
