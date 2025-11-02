import React, { useState } from 'react';
import { CurrencyChart } from './components/CurrencyChart';
import { CurrencyGrid } from './components/CurrencyGrid';

function App() {
  // Dummy data
  const dummyData = [
    { date: '2025-11-01', rate: 1.15 },
    { date: '2025-11-02', rate: 1.17 },
    { date: '2025-11-03', rate: 1.16 },
    { date: '2025-11-04', rate: 1.18 },
    { date: '2025-11-05', rate: 1.19 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Currency Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Exchange Rate Chart</h2>
        <div className="w-full h-96 bg-white p-4 rounded-lg shadow-md">
          <CurrencyChart data={dummyData} loading={false} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Detailed Data</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <CurrencyGrid data={dummyData} loading={false} />
        </div>
      </div>
    </div>
  );
}

export default App;
