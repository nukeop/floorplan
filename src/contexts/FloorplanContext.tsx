import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceType, Device, Room, MountPosition } from '@/types';

interface FloorplanContextType {
  // State
  devices: Device[];
  rooms: Room[];
  selectedDeviceType: DeviceType | null;
  selectedDevice: Device | null;
  selectedRoom: Room | null;
  selectedMountPosition: MountPosition;
  isLoading: boolean;
  
  // Device operations
  addDevice: (x: number, y: number) => void;
  updateDevicePosition: (id: string, x: number, y: number) => void;
  updateDeviceMountPosition: (id: string, position: MountPosition) => void;
  selectDevice: (device: Device | null) => void;
  rotateDevice: (id: string) => void;
  deleteDevice: (id: string) => void;
  setSelectedDeviceType: (type: DeviceType | null) => void;
  setSelectedMountPosition: (position: MountPosition) => void;
  
  // Room operations
  addRoom: (name: string, color: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  selectRoom: (room: Room | null) => void;
  
  // Configuration operations
  exportConfiguration: () => void;
  importConfiguration: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FloorplanContext = createContext<FloorplanContextType | undefined>(undefined);

interface FloorplanProviderProps {
  children: ReactNode;
}

// Provider component
export const FloorplanProvider: React.FC<FloorplanProviderProps> = ({ children }) => {
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

  const selectDevice = (device: Device | null) => {
    setSelectedDevice(device);
    if (device) {
      setSelectedRoom(null);
    }
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

  const selectRoom = (room: Room | null) => {
    setSelectedRoom(room);
    if (room) {
      setSelectedDevice(null);
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

  // Auto-select appropriate mount position based on device type
  useEffect(() => {
    if (selectedDeviceType) {
      switch (selectedDeviceType) {
        case DeviceType.CEILING_LIGHT:
        case DeviceType.CEILING_SENSOR:
          setSelectedMountPosition(MountPosition.CEILING);
          break;
        case DeviceType.SWITCH:
        case DeviceType.SMART_SWITCH:
        case DeviceType.THERMOSTAT:
          setSelectedMountPosition(MountPosition.WALL_HIGH);
          break;
        case DeviceType.SOCKET:
        case DeviceType.SMART_SOCKET:
        case DeviceType.ETHERNET:
        case DeviceType.TV_OUTLET:
          setSelectedMountPosition(MountPosition.WALL_MEDIUM);
          break;
        default:
          break;
      }
    }
  }, [selectedDeviceType]);

  // Create the value object containing all state and methods
  const value: FloorplanContextType = {
    // State
    devices,
    rooms,
    selectedDeviceType,
    selectedDevice,
    selectedRoom,
    selectedMountPosition,
    isLoading,
    
    // Device operations
    addDevice,
    updateDevicePosition,
    updateDeviceMountPosition,
    selectDevice,
    rotateDevice,
    deleteDevice,
    setSelectedDeviceType,
    setSelectedMountPosition,
    
    // Room operations
    addRoom,
    updateRoom,
    deleteRoom,
    selectRoom,
    
    // Configuration operations
    exportConfiguration,
    importConfiguration,
  };

  return (
    <FloorplanContext.Provider value={value}>
      {children}
    </FloorplanContext.Provider>
  );
};

export const useFloorplan = (): FloorplanContextType => {
  const context = useContext(FloorplanContext);
  if (context === undefined) {
    throw new Error('useFloorplan must be used within a FloorplanProvider');
  }
  return context;
};