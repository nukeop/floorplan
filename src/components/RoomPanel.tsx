import React, { useState, useEffect } from 'react';
import { useFloorplan } from '@/contexts/FloorplanContext';

const RoomPanel: React.FC = () => {
  const {
    rooms,
    selectedRoom,
    selectRoom,
    addRoom,
    updateRoom,
    deleteRoom,
  } = useFloorplan();

  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomColor, setNewRoomColor] = useState<string>('#4B5563');
  
  const [editMode, setEditMode] = useState<boolean>(false);
  
  const [showPositionSize, setShowPositionSize] = useState<boolean>(false);
  const [roomX, setRoomX] = useState<number>(0);
  const [roomY, setRoomY] = useState<number>(0);
  const [roomWidth, setRoomWidth] = useState<number>(200);
  const [roomHeight, setRoomHeight] = useState<number>(150);
  
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
  
  const handlePositionSizeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom && showPositionSize) {
      const width = Math.max(10, roomWidth);
      const height = Math.max(10, roomHeight);
      
      updateRoom(selectedRoom.id, {
        x: roomX,
        y: roomY,
        width,
        height
      });
      setShowPositionSize(false);
    }
  };
  
  const handleEditRoom = () => {
    if (selectedRoom) {
      setNewRoomName(selectedRoom.name);
      setNewRoomColor(selectedRoom.color || '#4B5563');
      setEditMode(true);
    }
  };
  
  useEffect(() => {
    if (selectedRoom) {
      setNewRoomName(selectedRoom.name);
      setNewRoomColor(selectedRoom.color || '#4B5563');
      setRoomX(selectedRoom.x);
      setRoomY(selectedRoom.y);
      setRoomWidth(selectedRoom.width);
      setRoomHeight(selectedRoom.height);
    } else {
      setEditMode(false);
      setShowPositionSize(false);
    }
  }, [selectedRoom]);
  
  const handleCancelEdit = () => {
    setEditMode(false);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Room Management</h3>
      
      {/* Room list */}
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
      
      {/* Room creation form */}
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
      
      {/* Room editing form */}
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

                {showPositionSize ? (
                  <form onSubmit={handlePositionSizeUpdate} className="mt-3">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600">Position X:</label>
                        <input 
                          type="number"
                          className="w-full p-1 text-xs border border-gray-300 rounded"
                          value={roomX}
                          onChange={(e) => setRoomX(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Position Y:</label>
                        <input 
                          type="number"
                          className="w-full p-1 text-xs border border-gray-300 rounded"
                          value={roomY}
                          onChange={(e) => setRoomY(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Width:</label>
                        <input 
                          type="number"
                          className="w-full p-1 text-xs border border-gray-300 rounded"
                          value={roomWidth}
                          min="10"
                          onChange={(e) => setRoomWidth(parseInt(e.target.value) || 10)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Height:</label>
                        <input 
                          type="number"
                          className="w-full p-1 text-xs border border-gray-300 rounded"
                          value={roomHeight}
                          min="10"
                          onChange={(e) => setRoomHeight(parseInt(e.target.value) || 10)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1 px-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPositionSize(false)}
                        className="flex-1 py-1 px-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Hide
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="text-xs text-gray-500">
                      Position: ({selectedRoom.x}, {selectedRoom.y})
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Size: {selectedRoom.width} × {selectedRoom.height}
                    </div>
                    <button
                      onClick={() => setShowPositionSize(true)}
                      className="w-full py-1 px-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mb-3"
                    >
                      Edit Position/Size
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleEditRoom}
                  className="flex-1 py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Name/Color
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