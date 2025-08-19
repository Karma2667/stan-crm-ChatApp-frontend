import { useEffect, useRef, useState } from 'react';
import EmojiPickerLib, { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        title="Эмодзи"
      >
        😀
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 z-50">
          <EmojiPickerLib
            onEmojiClick={(emojiData) => {
              onSelect(emojiData.emoji);
              setIsOpen(false);
            }}
            theme={Theme.LIGHT}
          />
        </div>
      )}
    </div>
  );
}

export default EmojiPicker;
