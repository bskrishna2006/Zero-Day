import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2, Send, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

interface Message {
  _id: string;
  content: string;
  isBot: boolean;
  createdAt: string;
}

interface ChatSession {
  _id: string;
  title: string;
  userId: string;
  active: boolean;
  createdAt: string;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initializing, setInitializing] = useState(true);

  // Fetch chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/chatbot/sessions');
        setSessions(response.data);
        
        // If there are sessions, set the most recent one as active
        if (response.data.length > 0) {
          setActiveSession(response.data[0]._id);
        }
        setInitializing(false);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat sessions',
          variant: 'destructive'
        });
        setInitializing(false);
      }
    };

    fetchSessions();
  }, [toast]);

  // Fetch messages when active session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSession) return;
      
      try {
        const response = await api.get(`/chatbot/sessions/${activeSession}`);
        setMessages(response.data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat messages',
          variant: 'destructive'
        });
      }
    };

    fetchMessages();
  }, [activeSession, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = async () => {
    try {
      setLoading(true);
      const response = await api.post('/chatbot/sessions', {
        title: 'New Chat'
      });
      setSessions(prevSessions => [response.data, ...prevSessions]);
      setActiveSession(response.data._id);
      setMessages([]);
      setLoading(false);
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    // Create a new session if there isn't an active one
    if (!activeSession) {
      try {
        setLoading(true);
        const sessionResponse = await api.post('/chatbot/sessions', {
          title: 'New Chat'
        });
        const newSessionId = sessionResponse.data._id;
        setSessions(prevSessions => [sessionResponse.data, ...prevSessions]);
        setActiveSession(newSessionId);
        
        // Now send the message with the new session ID
        await sendMessageToSession(newSessionId, newMessage);
        setLoading(false);
      } catch (error) {
        console.error('Error creating session and sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive'
        });
        setLoading(false);
      }
    } else {
      // Use existing session to send message
      await sendMessageToSession(activeSession, newMessage);
    }
  };

  const sendMessageToSession = async (sessionId: string, content: string) => {
    try {
      setLoading(true);
      
      // Optimistically add user message to UI
      const tempUserMessage = {
        _id: `temp-${Date.now()}`,
        content,
        isBot: false,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMessage]);
      setNewMessage('');
      
      // Send message to API
      const response = await api.post(`/chatbot/sessions/${sessionId}/messages`, {
        content
      });
      
      // Replace temp message with actual message and add bot response
      setMessages(prev => [
        ...prev.filter(msg => msg._id !== tempUserMessage._id),
        response.data.userMessage,
        response.data.botResponse
      ]);
      
      // Update session list if the title changed (for first message)
      if (response.data.sessionUpdated) {
        setSessions(prev => 
          prev.map(session => 
            session._id === sessionId 
              ? { ...session, title: response.data.sessionUpdated.title } 
              : session
          )
        );
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const switchSession = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 flex h-[calc(100vh-100px)]">
      {/* Sessions sidebar */}
      <div className="w-1/4 border-r pr-4 flex flex-col">
        <Button 
          onClick={createNewSession} 
          className="mb-4 w-full" 
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <ScrollArea className="flex-grow">
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    activeSession === session._id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => switchSession(session._id)}
                >
                  <h3 className="font-medium truncate">{session.title}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : initializing ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No chat sessions yet
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="w-3/4 flex flex-col pl-4">
        <Card className="flex-grow overflow-hidden flex flex-col">
          <ScrollArea className="flex-grow p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isBot
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {formatMessageDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : initializing || (activeSession && messages.length === 0) ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center">
                <h3 className="text-xl font-semibold">Campus Assist AI</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Ask questions about campus resources, academic policies, or get help with your studies.
                </p>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow resize-none"
                rows={2}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button type="submit" disabled={loading || !newMessage.trim()} size="icon">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
