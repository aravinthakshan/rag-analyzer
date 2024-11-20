import React from 'react';
import { FileText, Upload, Settings, Layers } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-400">Analyzer</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {[
            { icon: <Upload className="w-5 h-5" />, label: 'Uploaded Documents' },
            { icon: <FileText className="w-5 h-5" />, label: 'Text Analysis' },
            // { icon: <Layers className="w-5 h-5" />, label: 'Document Library' },
            // { icon: <Settings className="w-5 h-5" />, label: 'Settings' }
          ].map((item, index) => (
            <li key={index}>
              <a href="#" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 transition">
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;