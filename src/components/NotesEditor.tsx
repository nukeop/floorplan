import React from 'react';

interface NotesEditorProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  label?: string;
  readOnly?: boolean;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  label,
  readOnly = false
}) => {
  return (
    <div className="notes-editor">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {readOnly ? (
        <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[96px] whitespace-pre-line">
          {value || <span className="text-gray-400">No notes</span>}
        </div>
      ) : (
        <textarea
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || "Add notes here..."}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      )}
    </div>
  );
};

export default NotesEditor;