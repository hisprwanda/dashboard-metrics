import React from 'react';

interface GenericErrorProps {
  message: string;
}

const GenericError: React.FC<GenericErrorProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-red-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Error</h1>
        <p className="mt-4 text-lg text-gray-700">{message || "Something went wrong, try again"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default GenericError;
