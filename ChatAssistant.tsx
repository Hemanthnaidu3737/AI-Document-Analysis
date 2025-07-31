
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { BotIcon, SendIcon, UserIcon, Loader } from './icons';

interface ChatAssistantProps {
  chatHistory: ChatMessage[];
  onQuestionSubmit: (question: string) => void;
  isLoading: boolean;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ chatHistory, onQuestionSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onQuestionSubmit(question);
      setQuestion('');
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h3 className="text-lg font-bold text-slate-100 flex-shrink-0">Q&A Assistant</h3>
      <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
        {chatHistory.map((message, index) => {
          const isLastMessage = index === chatHistory.length - 1;
          const showLoaderInBubble = isLoading && isLastMessage && message.role === 'model' && message.content.length === 0;

          return (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-slate-700 text-slate-200 rounded-br-none'
                    : 'bg-slate-700/50 text-slate-300 rounded-bl-none'
                }`}
              >
                {showLoaderInBubble ? (
                   <Loader size="sm"/>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
               {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="flex-shrink-0 flex items-center gap-2 border-t border-slate-700 pt-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document..."
          disabled={isLoading}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
