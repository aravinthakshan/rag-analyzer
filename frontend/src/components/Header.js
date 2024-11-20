import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-900 px-6 py-4 flex justify-between items-center">
      {/* <div className="flex items-center space-x-4">
        <input 
          type="text" 
          placeholder="Search documents..." 
          className="bg-gray-800 text-gray-100 border-none rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500"
        />
      </div> */}
      <div className="flex items-center space-x-5">
        {/* <button className="text-gray-400 hover:text-gray-100">
          <Bell className="w-5 h-5" />
        </button> */}
        {/* <div className="flex items-center space-x-2"> */}
          {/* <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center"> */}
            {/* <User className="w-5 h-5 text-white" /> */}
          {/* </div> */}
          {/* <span>User</span> */}
        {/* </div> */}
      </div>
    </header>
  );
};

export default Header;