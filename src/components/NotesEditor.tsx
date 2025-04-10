import React from 'react';

interface NotesEditorProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  label?: string;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  label 
}) => {
  return (
    <div className="notes-editor">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder || "Add notes here..."}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        rows={4}
      />
    </div>
  );
};

export default NotesEditor;