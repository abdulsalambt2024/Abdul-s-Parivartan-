
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, Mic, Volume2, VolumeX } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hi! I am your community assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await geminiService.chat(userMsg, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);

    if (!isMuted) {
        speak(response);
    }
  };

  const speak = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // Stop any previous speech
          if (isMuted) return;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => {
              // Optional: logic when speech finishes
          };
          window.speechSynthesis.speak(utterance);
      }
  };

  const stopSpeaking = () => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
      }
  };

  const toggleMute = () => {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      if (newMuteState) {
          stopSpeaking();
      }
  };

  const handleClose = () => {
      setIsOpen(false);
      stopSpeaking();
      if (isListening && recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
      }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice input is not supported in this browser.");
        return;
    }
    
    // Stop speaking if user wants to talk
    stopSpeaking();

    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-[88px] right-4 md:bottom-6 md:right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
        title="AI Assistant"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-[88px] right-4 md:bottom-20 md:right-6 w-full max-w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gray-900 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleMute} 
                    className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={handleClose} className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                    <X size={20} />
                </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm relative group ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                  {m.text}
                  {m.role === 'model' && !isMuted && (
                      <button 
                        onClick={() => speak(m.text)} 
                        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition"
                        title="Replay"
                      >
                          <Volume2 size={16} />
                      </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                   <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <button 
                type="button"
                onClick={startListening}
                className={`p-2 rounded-full transition ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Voice Input"
            >
                <Mic size={20} />
            </button>
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="p-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
