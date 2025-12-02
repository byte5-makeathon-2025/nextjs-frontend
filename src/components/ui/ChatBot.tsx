import React, { useState, useEffect } from "react";
import IconButton from "./IconButton";
import { CandyCane, Loader, Mail } from "lucide-react";
import { SantaIcon } from "../icons/santa";
import { api } from "@/lib/api";

interface ChatBotProps {
  initialMessages?: string[];
}

const MOCKED_DATA = [
  "Hello! How can I help you, my little Elf?",
  "I'm here to help you with any questions you have about your wish.",
  "This year you was a very bad boy!!!!",
];

const ChatBot: React.FC<ChatBotProps> = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; error: boolean }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mockedData, setMockedData] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { text: inputValue, isUser: true, error: false }]);
    setInputValue("");
    setIsTyping(true);
    // Mocked Data
    // setTimeout(() => {
    //   setMessages((prev) => [...prev, { text: MOCKED_DATA[mockedData], isUser: false }]);
    //   setMockedData((prev) => prev + 1);
    //   setIsTyping(false);
    // }, 2500);
    try {
      const data = await api.santa.chat(inputValue);
      setMessages((prev) => [...prev, { text: data, isUser: false, error: false }]);
      setIsTyping(false);
    } catch {
      setMessages((prev) => [...prev, { text: "Santa is very bussy packing your gifts.", isUser: false, error: true }]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-10 right-10">
      <IconButton onClick={handleToggleChat} variant="primary" icon={<CandyCane className="w-4 h-4" />}>
        <></>
      </IconButton>
      {isChatOpen && (
        <div className="fixed bottom-20 right-10 w-80 bg-white p-4 rounded-lg shadow-lg">
          <SantaIcon className="absolute w-30 top-0 right-1/2 translate-x-1/2 -translate-y-1/2" />
          <div className="h-80 overflow-y-auto mb-4 mt-20 p-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${message.error ? "text-red-800" : message.isUser ? "text-right text-slate-800" : "text-left text-slate-600"}`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded px-2 py-1 mr-2 text-slate-800"
            />
            <IconButton
              onClick={handleSend}
              disabled={isTyping}
              fullWidth
              variant="primary"
              icon={!isTyping && <Mail className="w-4 h-4" />}
              className="py-3"
            >
              {isTyping ? <Loader className="w-4 h-4 animate-pulse" /> : ""}
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
