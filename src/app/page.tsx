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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      setIsLoading(true);
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
        } finally {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      };
      reader.readAsText(file);
    }
  };

  const addRoom = (name: string, color: string) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color,
    };
    
    setRooms([...rooms, newRoom]);
    setSelectedRoom(newRoom);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(
      rooms.map(room => room.id === id ? { ...room, ...updates } : room)
    );
  };

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
    if (selectedRoom?.id === id) {
      setSelectedRoom(null);
    }
  };

  // Effect to handle saving configuration to local storage
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem('smart-home-devices', JSON.stringify(devices));
    }
  }, [devices]);

  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem('smart-home-rooms', JSON.stringify(rooms));
    }
  }, [rooms]);

  // Effect to load saved configuration
  useEffect(() => {
    setIsLoading(true);
    const savedDevices = localStorage.getItem('smart-home-devices');
    if (savedDevices) {
      try {
        setDevices(JSON.parse(savedDevices));
      } catch (error) {
        console.error('Error loading saved configuration:', error);
      }
    }
    
    const savedRooms = localStorage.getItem('smart-home-rooms');
    if (savedRooms) {
      try {
        setRooms(JSON.parse(savedRooms));
      } catch (error) {
        console.error('Error loading saved rooms:', error);
      }
    }
    
    // Simulate a small delay to prevent flashing if loading is very quick
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-slate-800 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Smart Home Planner</h1>
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
          rooms={rooms}
          selectedRoom={selectedRoom}
          selectRoom={setSelectedRoom}
          addRoom={addRoom}
          updateRoom={updateRoom}
          deleteRoom={deleteRoom}
        />
        
        <FloorPlan 
          rooms={rooms}
          devices={devices}
          selectedDeviceType={selectedDeviceType}
          addDevice={addDevice}
          updateDevicePosition={updateDevicePosition}
          selectDevice={setSelectedDevice}
          selectedDevice={selectedDevice}
          selectedRoom={selectedRoom}
          selectRoom={setSelectedRoom}
          updateRoom={updateRoom}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}