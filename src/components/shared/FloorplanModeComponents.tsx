"use client";
import React from 'react';
import FloorPlan from '@/components/FloorPlan';
import ControlPanel from '@/components/ControlPanel';
import DeviceDetailsPanel from '@/components/DeviceDetailsPanel';
import { useFloorplan } from '@/contexts/FloorplanContext';

export function FloorplanContent() {
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
    rotateDevice,
    isEditorMode
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
          readOnly={!isEditorMode}
        />
      )}
    </div>
  );
}