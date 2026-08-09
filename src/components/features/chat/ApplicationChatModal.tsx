'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

interface ChatModalProps {
  chatId: string;
  chatType: 'application' | 'contact';
  isOpen: boolean;
  onClose: () => void;
  title: string;
  candidateName?: string;
  recruiterName?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
}

export function ApplicationChatModal({ chatId, chatType, isOpen, onClose, title, candidateName, recruiterName }: ChatModalProps) {
  const { accessToken, role } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [appMetadata, setAppMetadata] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getApiBaseUrl = () => {
    return chatType === 'application' 
      ? `/jobs/applications/${chatId}`
      : `/contacts/${chatId}`;
  };

  const fetchMessages = async () => {
    try {
      const response = await fetchApi(`${getApiBaseUrl()}/messages`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && (data.application || data.contactRequest)) {
          setMessages(data.messages);
          setAppMetadata(data.application || data.contactRequest);
        } else {
          setMessages(Array.isArray(data) ? data : (data.data || []));
        }
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    setIsLoading(true);
    fetchMessages();

    // SSE para mensajes en tiempo real
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const sseUrl = `${baseUrl}${getApiBaseUrl()}/messages/stream`;
    
    let isMounted = true;
    let abortController = new AbortController();

    const connectSSE = async () => {
      try {
        const response = await fetch(sseUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'text/event-stream'
          },
          signal: abortController.signal
        });

        if (!response.ok || !response.body) {
          throw new Error('No se pudo conectar al stream SSE del chat');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (isMounted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const dataStr = line.replace(/^data:\s*/, '').trim();
              if (!dataStr) continue;
              
              try {
                const newMsg: Message = JSON.parse(dataStr);
                
                // Agregar el nuevo mensaje
                setMessages(prev => {
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              } catch (e) {
                console.error('Error parsing chat SSE event', e);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Chat SSE Error (reintentando en 5s)...', err);
          setTimeout(connectSSE, 5000);
        }
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isOpen, chatId, accessToken]);

  useEffect(() => {
    // Scroll al último mensaje
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetchApi(`${getApiBaseUrl()}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 lg:p-12">
      <div className="bg-white dark:bg-[#161616] w-full h-full md:max-w-5xl md:h-[90vh] md:rounded-3xl shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#161616] shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              {chatType === 'application' ? 'P' : 'C'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {chatType === 'application' ? 'Postulación' : 'Contacto Directo'}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{title}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[url('/img/chat-bg.png')] bg-gray-50/50 dark:bg-[#0A0A0A]">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 bg-white/50 dark:bg-black/20 p-8 rounded-3xl mx-auto max-w-md text-center border border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-2">
                <Send className="w-8 h-8 text-indigo-300 dark:text-indigo-700 ml-1" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300">Aún no hay mensajes</p>
              <p className="text-sm">¡Escribe el primer mensaje para iniciar la conversación!</p>
            </div>
          ) : (
            messages.map((msg) => {
              // Determinar si el mensaje es del usuario actual.
              // El backend nuevo devuelve sender.role en lugar de senderRole en la raiz, lo respaldamos.
              const msgRole = msg.senderRole || (msg as any).sender?.role;
              const isMine = msgRole === role;
              
              // Nombres dinámicos desde el backend si existen
              const resolvedRecruiterName = appMetadata?.jobPosition?.recruiter?.companyName || appMetadata?.recruiter?.companyName || recruiterName || 'Empresa';
              const resolvedCandidateName = appMetadata?.profile?.displayName || candidateName || 'Candidato';

              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isMine ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                  <span className="text-[11px] font-medium text-gray-400 mb-1.5 px-1">
                    {isMine ? 'Tú' : msgRole === 'RECRUITER' ? resolvedRecruiterName : resolvedCandidateName} • {new Date(msg.createdAt).toLocaleDateString('es-ES', { hour: '2-digit', minute:'2-digit' })}
                  </span>
                  <div className={`p-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-[#161616] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#161616] flex gap-3 items-end">
          <textarea
            className="w-full flex-1 min-h-[52px] max-h-[160px] p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-2xl text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            placeholder="Escribe tu mensaje aquí..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit"
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 rounded-full w-12 h-12 mb-0.5 shadow-md transition-transform active:scale-95"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </Button>
        </form>

      </div>
    </div>
  );
}
