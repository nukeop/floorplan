"use client";

import React from 'react';
import FloorPlan from '@/components/FloorPlan';
import ControlPanel from '@/components/ControlPanel';
import { FloorplanProvider } from '@/contexts/FloorplanContext';

export default function SmartHomePlanner() {
  return (
    <FloorplanProvider>
      <div className="flex flex-col h-screen">
        <header className="bg-slate-800 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Smart Home Planner</h1>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          <ControlPanel />
          <FloorPlan />
        </div>
      </div>
    </FloorplanProvider>
  );
}