import React from 'react'

const Inquiry = ({name, inquiry, datetime}) => {
  return (
    <div class="bg-white rounded-lg shadow-md border p-4">
        <div class="flex items-center mb-4">
            <img class="w-12 h-12 rounded-full mr-3" src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" alt="Profile Image"/>
            <div>
                <h2 class="text-lg font-semibold">{name}</h2>
                <p class="text-gray-500 text-sm">Published on {datetime}</p>
            </div>
        </div>
        <p class="text-gray-700 mb-4">
            {inquiry}
        </p>
    </div>
  )
}

export default Inquiry
