import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Auth, ChatMessage as MessageType, Chat } from '@/types/chat';
import ChatHeader from './ChatHeader';
import PinnedMessage from './PinnedMessage';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ForwardChatModal from './ForwardChatModal';

interface ChatWindowProps {
  chatId: number | undefined;
  auth: Auth;
  goBack?: () => void;
  api: any;
}

function ChatWindow({ chatId, auth, goBack, api }: ChatWindowProps) {
  const { chats, messages, addMessage, removeMessage, forwardMessage } = useChatStore();
  const currentChat = chats.find((c: Chat) => c.id === chatId);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [messageText, setMessageText] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [selectChatForForward, setSelectChatForForward] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatId]);

  const getMessageById = (id: string) => messages[chatId!]?.find(msg => msg.id === id);

  const getRandomColor = (name: string): string => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: messageText,
      author: 'Ты',
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sent',
    };

    addMessage(chatId!, newMessage);
    setMessageText('');
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-gray-50 dark:bg-gray-900 relative">
      {chatId && currentChat && (
        <>
          <ChatHeader chat={currentChat} goBack={goBack} />
          {pinnedMessage && <PinnedMessage message={pinnedMessage} onUnpin={() => setPinnedMessage(null)} />}

          <MessageList
            chatId={chatId}
            messages={messages[chatId] || []}
            messagesEndRef={messagesEndRef}
            getMessageById={getMessageById}
            onDelete={async (id: string) => {
              await api.deleteMessage(chatId, id, auth);
              removeMessage(chatId, id);
            }}
            onEdit={setEditingMessage}
            onReply={setReplyingTo}
            onPin={setPinnedMessage}
            onForward={(id: string) => {
              setForwardingMessageId(id);
              setSelectChatForForward(true);
            }}
          />

          <MessageInput
            chatId={chatId}
            auth={auth}
            api={api}
            messageText={messageText}
            setMessageText={setMessageText}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            fileInputRef={fileInputRef}
            addMessage={(msg) => addMessage(chatId, msg)}
          />

          {selectChatForForward && (
            <ForwardChatModal
              chats={chats.filter(c => c.id !== chatId)}
              getRandomColor={getRandomColor}
              onSelect={(targetChatId) => {
                if (forwardingMessageId) forwardMessage(forwardingMessageId, targetChatId);
                setForwardingMessageId(null);
                setSelectChatForForward(false);
              }}
              onClose={() => setSelectChatForForward(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ChatWindow;
