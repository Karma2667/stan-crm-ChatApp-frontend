import { ChatMessage as MessageType } from '@/types/chat';
import { Trash2, Check, CheckCheck, Pin, Pencil, Reply } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface ChatMessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: MessageType) => void;
  onPin?: (message: MessageType) => void;
  onReply?: (message: MessageType) => void;
  onForward?: (messageId: string) => void;
  getMessageById?: (id: string) => MessageType | undefined;
}

function ChatMessage({
  message,
  isOwnMessage,
  onDelete,
  onEdit,
  onPin,
  onReply,
  onForward,
  getMessageById,
}: ChatMessageProps) {
  const handleDelete = () => onDelete && isOwnMessage && onDelete(message.id);
  const handleEdit = () => onEdit && isOwnMessage && onEdit(message);
  const handlePin = () => onPin && onPin(message);
  const handleReply = () => onReply && onReply(message);
  const handleForward = () => onForward && onForward(message.id);

  const renderAttachment = () => {
    if (!message.attachment) return null;
    const { url, type, name } = message.attachment;

    if (type.startsWith('image/')) {
      return (
        <img
          src={url}
          alt={name}
          className="max-w-[220px] mt-2 rounded-lg cursor-pointer"
          onClick={() => window.open(url, '_blank')}
        />
      );
    }

    return (
      <a
        href={url}
        download={name}
        className={`mt-2 flex items-center text-sm ${
          isOwnMessage
            ? 'text-white hover:text-gray-200'
            : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 7h-2v4H9V7H7l5-5 5 5h-2v6H7v-2h6V7z" />
        </svg>
        {name}
      </a>
    );
  };

  const renderReplyPreview = () => {
    if (!message.replyTo || !getMessageById) return null;
    const original = getMessageById(message.replyTo);
    if (!original) return null;
    return (
      <div className="mb-2 px-2 py-1 rounded bg-black/10 dark:bg-white/10 text-xs">
        <span className="font-semibold">{original.author}</span>: {original.text || 'Вложение'}
      </div>
    );
  };

  const renderForwardPreview = () => {
    if (!message.forwardedFromId || !getMessageById) return null;
    const original = getMessageById(message.forwardedFromId);
    if (!original) return null;
    return (
      <div className="mb-2 px-2 py-1 rounded flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400 dark:border-gray-500">
        <ArrowRight className="w-3 h-3 text-gray-700 dark:text-gray-300" />
        <span className="font-semibold">{original.author}</span>: {original.text || 'Вложение'}
      </div>
    );
  };

  return (
    <div className={`flex flex-col mb-3 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <div
        className={`relative group p-3 max-w-[65%] min-w-[200px] rounded-xl shadow-sm flex flex-col ${
          isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
        }`}
      >
        {renderForwardPreview()}
        {renderReplyPreview()}
        {message.text && <p className="text-sm">{message.text}</p>}
        {renderAttachment()}
        <div
          className={`flex items-center gap-1 text-[11px] mt-1 ${
            isOwnMessage ? 'justify-end text-white/70' : 'justify-end text-gray-500 dark:text-gray-400'
          }`}
        >
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {isOwnMessage && (message.isRead ? <CheckCheck className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-white/70" />)}
        </div>

        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {onReply && (
            <button onClick={handleReply} className="p-1 rounded-full bg-black/30 hover:bg-black/50" title="Ответить">
              <Reply className="w-4 h-4 text-white" />
            </button>
          )}
          {onPin && (
            <button onClick={handlePin} className="p-1 rounded-full bg-black/30 hover:bg-black/50" title="Закрепить">
              <Pin className="w-4 h-4 text-white" />
            </button>
          )}
          {onForward && (
            <button onClick={handleForward} className="p-1 bg-black/30 hover:bg-black/50" title="Переслать">
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}
          {isOwnMessage && onEdit && (
            <button onClick={handleEdit} className="p-1 rounded-full bg-black/30 hover:bg-black/50" title="Редактировать">
              <Pencil className="w-4 h-4 text-white" />
            </button>
          )}
          {isOwnMessage && onDelete && (
            <button onClick={handleDelete} className="p-1 rounded-full bg-black/30 hover:bg-black/50" title="Удалить">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
