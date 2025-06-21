import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const WeatherChatbot = ({ getWeatherReply, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! 👋 Ask me about any city's weather." }
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const reply = await getWeatherReply(input.trim());
    setMessages(prev => [...prev, { type: "bot", text: reply }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 left-8 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 flex items-center justify-center ${
          isOpen 
            ? isDarkMode
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-400/50 shadow-red-500/25'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-400/50 shadow-red-500/25'
            : isDarkMode
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white focus:ring-purple-400/50 shadow-purple-500/25'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-400/50 shadow-blue-500/25'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white transition-transform duration-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 left-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl w-80 shadow-xl z-50 transition-all duration-300 transform animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className={`p-4 border-b font-semibold text-white rounded-t-xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">☁️</span>
              <span>WeatherBot</span>
            </div>
          </div>

          {/* Messages */}
          <div className="p-3 h-72 overflow-y-auto space-y-2 text-sm bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-lg max-w-[80%] shadow-sm transition-all duration-200 ${
                  msg.type === "user"
                    ? isDarkMode
                      ? "ml-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "ml-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatRef} />
          </div>

          {/* Input Area */}
          <div className="flex border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-900 rounded-b-xl">
            <input
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`ml-2 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                input.trim()
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherChatbot;