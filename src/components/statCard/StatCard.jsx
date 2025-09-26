import React from 'react';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold mt-2">{value}</div>
  </div>
);

export default StatCard;