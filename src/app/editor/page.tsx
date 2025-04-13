"use client";
import React from 'react';
import { FloorplanProvider } from '@/contexts/FloorplanContext';
import { FloorplanContent, ModeToggle } from '@/components/shared/FloorplanModeComponents';

export default function EditorPage() {
  return (
    <FloorplanProvider initialEditorMode={true}>
      <div className="flex flex-col h-screen">
        <ModeToggle />
        <FloorplanContent />
      </div>
    </FloorplanProvider>
  );
}