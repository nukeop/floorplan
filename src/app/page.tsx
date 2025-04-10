"use client";

import React from 'react';
import FloorPlan from '@/components/FloorPlan';
import ControlPanel from '@/components/ControlPanel';
import DeviceDetailsPanel from '@/components/DeviceDetailsPanel';
import { FloorplanProvider, useFloorplan } from '@/contexts/FloorplanContext';

function FloorplanWithDetails() {
  const {
    selectedDevice,
    selectedGroup,
    detailsPanelOpen,
    closeDetailsPanel,
    updateDeviceNotes,
    updateGroupNotes,
    removeDeviceFromGroup,
    updateDeviceMountPosition,
    rotateDevice
  } = useFloorplan();

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <ControlPanel />
      <FloorPlan />
      
      {detailsPanelOpen && (
        <DeviceDetailsPanel
          device={selectedDevice}
          group={selectedGroup}
          onUpdateDeviceNotes={updateDeviceNotes}
          onUpdateGroupNotes={updateGroupNotes}
          onClose={closeDetailsPanel}
          onRemoveDeviceFromGroup={removeDeviceFromGroup}
          onChangeMountPosition={updateDeviceMountPosition}
          onRotateDevice={rotateDevice}
        />
      )}
    </div>
  );
}

export default function SmartHomePlanner() {
  return (
    <FloorplanProvider>
      <div className="flex flex-col h-screen">
        <header className="bg-slate-800 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Smart Home Planner</h1>
        </header>
        
        <FloorplanWithDetails />
      </div>
    </FloorplanProvider>
  );
}