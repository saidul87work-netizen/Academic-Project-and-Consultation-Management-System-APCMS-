import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  _id: string;
  senderName: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function TeamMessages({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teams/${teamId}/messages`, {
        headers: { 'x-user-id': currentUserId }
      });
      setMessages(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      await axios.post(`${API_BASE}/teams/${teamId}/message`, { content: newMsg }, {
        headers: { 'x-user-id': currentUserId }
      });
      setNewMsg('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Connecting to team chat...</div>;

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Team Discussion</h3>
        <span className="text-[10px] uppercase font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Live</span>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 text-[10px] font-bold text-gray-400 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span>{msg.senderName}</span>
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-sm">Start the conversation!</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button 
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
