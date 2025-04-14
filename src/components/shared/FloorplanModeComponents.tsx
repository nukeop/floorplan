"use client";
import React from 'react';
import FloorPlan from '@/components/FloorPlan';
import ControlPanel from '@/components/ControlPanel';
import DeviceDetailsPanel from '@/components/DeviceDetailsPanel';
import { useFloorplan } from '@/contexts/FloorplanContext';

export function FloorplanContent() {
  const {
    detailsPanelOpen,
    isEditorMode
  } = useFloorplan();

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <ControlPanel />
      <FloorPlan />
      {detailsPanelOpen && (
        <DeviceDetailsPanel
          readOnly={!isEditorMode}
        />
      )}
    </div>
  );
}