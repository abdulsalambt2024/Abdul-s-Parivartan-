import React, { useState } from 'react';
import { ChatContact, ChatMessage, User } from '../types';
import { Search, MoreVertical, Send, Phone, Video, Smile, ShieldCheck } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

// Mock Data
const MOCK_CONTACTS: ChatContact[] = [
  { id: '1', name: 'Community Admin', avatar: 'https://ui-avatars.com/api/?name=Admin', lastMessage: 'Welcome to the group!', unreadCount: 2, verified: true },
  { id: '2', name: 'Alice Johnson', avatar: 'https://ui-avatars.com/api/?name=Alice', lastMessage: 'Did you see the event?', unreadCount: 0, verified: false },
  { id: '3', name: 'Bob Smith', avatar: 'https://ui-avatars.com/api/?name=Bob', lastMessage: 'Thanks for the help', unreadCount: 1, verified: false },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', senderId: '1', text: 'Hello everyone! Welcome to the community.', timestamp: Date.now() - 100000 },
    { id: 'm2', senderId: 'me', text: 'Hi Admin, glad to be here!', timestamp: Date.now() - 50000 },
    { id: 'm3', senderId: '1', text: 'Let me know if you need anything.', timestamp: Date.now() - 1000 },
  ]
};

export const ChatInterface: React.FC<ChatProps> = ({ currentUser }) => {
  const [activeContactId, setActiveContactId] = useState<string | null>('1');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const activeContact = MOCK_CONTACTS.find(c => c.id === activeContactId);
  const currentMessages = activeContactId ? (messages[activeContactId] || []) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages({
      ...messages,
      [activeContactId]: [...(messages[activeContactId] || []), newMessage]
    });
    setInputText('');

    // Similate reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeContactId,
        text: "That sounds great! 👍",
        timestamp: Date.now(),
      };
       setMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), reply]
      }));
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl overflow-hidden shadow-xl mx-4 my-4 border border-gray-200">
      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-gray-50 border-r border-gray-200 flex flex-col ${activeContactId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
          <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border" />
          <div className="flex gap-3 text-gray-500">
             <button><MoreVertical size={20} /></button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search chat" className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {MOCK_CONTACTS.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition border-b border-gray-100/50 ${activeContactId === contact.id ? 'bg-white shadow-sm' : ''}`}
            >
              <div className="relative">
                 <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                 {contact.verified && <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white"><ShieldCheck size={10} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                  <span className="text-xs text-gray-400">12:30</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
              </div>
              {contact.unreadCount > 0 && (
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {contact.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#e5ddd5] bg-opacity-30 ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
        {activeContactId && activeContact ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveContactId(null)} className="md:hidden text-gray-500 mr-1">
                    <Search size={20} className="rotate-90" /> {/* Mock back button */}
                </button>
                <img src={activeContact.avatar} alt="Contact" className="w-10 h-10 rounded-full" />
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                    {activeContact.name}
                    {activeContact.verified && <ShieldCheck size={14} className="text-green-500" />}
                  </h4>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-primary">
                <Phone className="cursor-pointer hover:bg-indigo-50 p-2 rounded-full w-9 h-9" />
                <Video className="cursor-pointer hover:bg-indigo-50 p-2 rounded-full w-9 h-9" />
                <MoreVertical className="cursor-pointer hover:bg-indigo-50 p-2 rounded-full w-9 h-9 text-gray-500" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain opacity-90">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm ${msg.senderId === 'me' ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1 block opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-gray-50 flex items-center gap-2">
              <Smile className="text-gray-500 cursor-pointer" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 focus:outline-none focus:border-primary"
              />
              <button type="submit" className="p-2.5 bg-primary text-white rounded-full hover:bg-indigo-600 transition shadow-md">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 flex-col text-gray-400">
             <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
             <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
