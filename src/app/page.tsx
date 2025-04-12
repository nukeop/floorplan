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
    updateGroupMountPosition,
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
          onChangeGroupMountPosition={updateGroupMountPosition}
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
        <FloorplanWithDetails />
      </div>
    </FloorplanProvider>
  );
}