"use client";

import React, { useState, useEffect } from 'react';
import FloorPlan from '@/components/FloorPlan';
import ControlPanel from '@/components/ControlPanel';
import { DeviceType, Device, Room, MountPosition } from '@/types';

export default function SmartHomePlanner() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedMountPosition, setSelectedMountPosition] = useState<MountPosition>(MountPosition.WALL_MEDIUM);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'room1', name: 'Room 1', x: 0, y: 580, width: 430, height: 370 },
    { id: 'room2', name: 'Room 2', x: 430, y: 650, width: 428, height: 300 },
    { id: 'room3', name: 'Room 3', x: 490, y: 60, width: 368, height: 590 },
    { id: 'kitchen', name: 'Kitchen', x: 0, y: 280, width: 490, height: 300 },
    { id: 'bathroom', name: 'Bathroom', x: 0, y: 160, width: 226, height: 120 },
    { id: 'hallway', name: 'Hallway', x: 226, y: 110, width: 264, height: 170 },
  ]);

  const addDevice = (x: number, y: number) => {
    if (!selectedDeviceType) return;
    
    const newDevice: Device = {
      id: `device-${Date.now()}`,
      type: selectedDeviceType,
      x,
      y,
      rotation: 0,
      position: selectedMountPosition,
    };
    
    setDevices([...devices, newDevice]);
    setSelectedDeviceType(null);
  };

  const updateDevicePosition = (id: string, x: number, y: number) => {
    setDevices(
      devices.map(device => 
        device.id === id ? { ...device, x, y } : device
      )
    );
  };

  const updateDeviceMountPosition = (id: string, position: MountPosition) => {
    setDevices(
      devices.map(device => 
        device.id === id ? { ...device, position } : device
      )
    );
  };

  const deleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
    }
  };

  const rotateDevice = (id: string) => {
    setDevices(
      devices.map(device => 
        device.id === id 
          ? { ...device, rotation: (device.rotation + 90) % 360 } 
          : device
      )
    );
  };

  const exportConfiguration = () => {
    const data = {
      rooms,
      devices,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-home-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          if (config.rooms && config.devices) {
            setRooms(config.rooms);
            setDevices(config.devices);
          }
        } catch (error) {
          console.error('Error parsing configuration file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Effect to handle saving configuration to local storage
  useEffect(() => {
    // Save configuration to localStorage when it changes
    if (devices.length > 0) {
      localStorage.setItem('smart-home-devices', JSON.stringify(devices));
    }
  }, [devices]);

  // Effect to load saved configuration
  useEffect(() => {
    // Load saved configuration on startup
    const savedDevices = localStorage.getItem('smart-home-devices');
    if (savedDevices) {
      try {
        setDevices(JSON.parse(savedDevices));
      } catch (error) {
        console.error('Error loading saved configuration:', error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-slate-800 text-white p-4 text-center">
        <h1 className="text-2xl font-bold"> Planner</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel 
          selectedDeviceType={selectedDeviceType}
          setSelectedDeviceType={setSelectedDeviceType}
          selectedDevice={selectedDevice}
          selectedMountPosition={selectedMountPosition}
          setSelectedMountPosition={setSelectedMountPosition}
          rotateDevice={rotateDevice}
          deleteDevice={deleteDevice}
          updateDevicePosition={updateDeviceMountPosition}
          exportConfiguration={exportConfiguration}
          importConfiguration={importConfiguration}
        />
        
        <FloorPlan 
          rooms={rooms}
          devices={devices}
          selectedDeviceType={selectedDeviceType}
          addDevice={addDevice}
          updateDevicePosition={updateDevicePosition}
          selectDevice={setSelectedDevice}
          selectedDevice={selectedDevice}
        />
      </div>
    </div>
  );
}