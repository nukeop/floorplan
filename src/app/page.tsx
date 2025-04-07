import React from 'react';

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Floorplan Designer</h2>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <p className="mb-4 text-gray-600">
          Welcome to your floorplan designer! Here you will be able to design and share your renovation plans, 
          including the placement of electrical sockets, switches, IoT sensors, and other elements.
        </p>
        
        <div className="mt-8 h-96 w-full rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Floorplan viewer will be displayed here</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Share Floorplan
        </button>
      </div>
    </div>
  );
}