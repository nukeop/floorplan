import React, { useState } from 'react';
import { Room } from '@/types';

interface RoomPanelProps {
  rooms: Room[];
  selectedRoom: Room | null;
  selectRoom: (room: Room | null) => void;
  addRoom: (name: string, color: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
}

const RoomPanel: React.FC<RoomPanelProps> = ({
  rooms,
  selectedRoom,
  selectRoom,
  addRoom,
  updateRoom,
  deleteRoom,
}) => {
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomColor, setNewRoomColor] = useState<string>('#4B5563');
  
  const [editMode, setEditMode] = useState<boolean>(false);
  
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      addRoom(newRoomName.trim(), newRoomColor);
      setNewRoomName('');
    }
  };
  
  const handleRoomUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom && editMode) {
      updateRoom(selectedRoom.id, {
        name: newRoomName,
        color: newRoomColor,
      });
      setEditMode(false);
    }
  };
  
  const handleEditRoom = () => {
    if (selectedRoom) {
      setNewRoomName(selectedRoom.name);
      setNewRoomColor(selectedRoom.color || '#4B5563');
      setEditMode(true);
    }
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Room Management</h3>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Rooms:</h4>
        <div className="max-h-48 overflow-y-auto bg-gray-50 rounded border border-gray-200">
          {rooms.length === 0 ? (
            <p className="p-2 text-sm text-gray-500">No rooms available</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li 
                  key={room.id}
                  className={`flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 cursor-pointer ${
                    selectedRoom?.id === room.id ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => selectRoom(room)}
                >
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: room.color || '#4B5563' }}
                    />
                    <span className="text-sm">{room.name}</span>
                  </div>
                  <button 
                    className="text-xs px-1 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoom(room.id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {!editMode && !selectedRoom && (
        <form onSubmit={handleAddRoom} className="p-3 bg-gray-50 rounded border border-gray-200 mb-4">
          <h4 className="text-sm font-medium mb-2">Add New Room:</h4>
          <div className="mb-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-3 flex items-center">
            <span className="mr-2 text-sm">Color:</span>
            <input
              type="color"
              value={newRoomColor}
              onChange={(e) => setNewRoomColor(e.target.value)}
              className="cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Room
          </button>
        </form>
      )}
      
      {selectedRoom && (
        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <h4 className="text-sm font-medium mb-2">
            {editMode ? 'Edit Room:' : 'Selected Room:'}
          </h4>
          
          {editMode ? (
            <form onSubmit={handleRoomUpdate}>
              <div className="mb-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-3 flex items-center">
                <span className="mr-2 text-sm">Color:</span>
                <input
                  type="color"
                  value={newRoomColor}
                  onChange={(e) => setNewRoomColor(e.target.value)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-1 px-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <span 
                    className="inline-block w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: selectedRoom.color || '#4B5563' }}
                  />
                  <span className="font-medium">{selectedRoom.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Position: ({selectedRoom.x}, {selectedRoom.y})
                </div>
                <div className="text-xs text-gray-500">
                  Size: {selectedRoom.width} × {selectedRoom.height}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleEditRoom}
                  className="flex-1 py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRoom(selectedRoom.id)}
                  className="flex-1 py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomPanel;