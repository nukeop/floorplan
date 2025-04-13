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

// Mode toggle component to switch between editor and viewer modes
export function ModeToggle() {
  const { isEditorMode } = useFloorplan();

  return (
    <div className="absolute top-4 right-4 z-10">
      <a
        href={isEditorMode ? '/' : '/editor'}
        className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {isEditorMode ? 'Switch to Viewer Mode' : 'Switch to Editor Mode'}
      </a>
    </div>
  );
}