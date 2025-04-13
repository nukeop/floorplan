"use client";
import React from 'react';
import { FaEye, FaEdit } from 'react-icons/fa';
import { useFloorplan } from '@/contexts/FloorplanContext';

export function ModeToggle() {
  const { isEditorMode } = useFloorplan();

  return (
    <div className="absolute top-4 right-4 z-10">
      <a
        href={isEditorMode ? '/' : '/editor'}
        className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none flex items-center justify-center"
        title={isEditorMode ? "Switch to Viewer Mode" : "Switch to Editor Mode"}
      >
        {isEditorMode ? <FaEye className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
      </a>
    </div>
  );
}