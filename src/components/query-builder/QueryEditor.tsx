import React, { useRef, useEffect } from 'react';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ value, onChange, darkMode }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={`relative rounded-md border overflow-hidden
      ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        spellCheck={false}
        className={`w-full p-3 font-mono text-sm resize-none outline-none
          ${darkMode 
            ? 'bg-transparent text-gray-100' 
            : 'bg-transparent text-gray-900'
          }`}
        placeholder="Enter your SQL query here..."
      />
    </div>
  );
};

export default QueryEditor;