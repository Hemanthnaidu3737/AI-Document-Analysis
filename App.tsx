
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { SummaryDisplay } from './components/SummaryDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { generateSummary, answerQuestionStream } from './services/geminiService';
import type { Summary, ChatMessage } from './types';
import { BotIcon, UserIcon, Loader } from './components/icons';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (uploadedFile: File, textContent: string) => {
    setFile(uploadedFile);
    setDocumentText(textContent);
    setSummary(null);
    setChatHistory([]);
    setError(null);
  };

  const handleSummarize = useCallback(async () => {
    if (!documentText) {
      setError("No document text available to summarize.");
      return;
    }
    setIsLoadingSummary(true);
    setError(null);
    setSummary(null);
    try {
      const result = await generateSummary(documentText);
      setSummary(result);
      setChatHistory([
        { role: 'model', content: "I've summarized the document for you. Feel free to ask me any questions about it." }
      ]);
    } catch (e) {
      console.error(e);
      setError("Failed to generate summary. Please check the console for details.");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [documentText]);

  const handleQuestionSubmit = async (question: string) => {
    if (!documentText || !question.trim() || isAnsweringQuestion) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const historyForApi = [...chatHistory, userMessage];
    
    setChatHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);
    setIsAnsweringQuestion(true);
    setError(null);

    try {
      const stream = answerQuestionStream(documentText, question, historyForApi);

      for await (const chunk of stream) {
        setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'model') {
            const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
            return [...prev.slice(0, -1), updatedLastMessage];
          }
          return prev;
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = "Sorry, I encountered an error trying to answer. Please try again.";
      setError(errorMessage);
       setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
           if (lastMessage?.role === 'model') {
            const updatedLastMessage = { ...lastMessage, content: errorMessage };
            return [...prev.slice(0, -1), updatedLastMessage];
          }
          return [...prev, { role: 'model', content: errorMessage }];
       });
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FileUploader onFileUpload={handleFileUpload} />
          {file && (
            <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between gap-4">
              <p className="text-slate-300 truncate">
                <span className="font-medium text-slate-100">File:</span> {file.name}
              </p>
              <button
                onClick={handleSummarize}
                disabled={isLoadingSummary || !documentText}
                className="flex-shrink-0 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoadingSummary ? 'Analyzing...' : 'Analyze Document'}
              </button>
            </div>
          )}
           {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg">
                <p><span className="font-bold">Error:</span> {error}</p>
            </div>
           )}
        </div>

        <div className="lg:row-span-2 flex flex-col gap-6 bg-slate-800/50 rounded-lg p-1">
          {isLoadingSummary ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <Loader />
                <p className="text-slate-400 mt-4">Generating intelligent summary...</p>
              </div>
            </div>
          ) : summary ? (
            <div className="flex flex-col h-full">
              <SummaryDisplay summary={summary} />
              <div className="border-t border-slate-700 flex-grow flex flex-col">
                  <ChatAssistant
                    chatHistory={chatHistory}
                    onQuestionSubmit={handleQuestionSubmit}
                    isLoading={isAnsweringQuestion}
                  />
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center text-slate-500 p-8">
              <div className="flex flex-col items-center gap-4">
                <BotIcon className="w-16 h-16" />
                <h3 className="text-xl font-semibold text-slate-300">Document Analysis Hub</h3>
                <p>Upload a document and click "Analyze" to generate a summary and start a Q&A session.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
