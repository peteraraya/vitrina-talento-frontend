'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  referenceId?: string;
  createdAt: string;
}

export function NotificationBell() {
  const { isAuthenticated, accessToken, _hasHydrated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadHistory = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await fetchApi('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !accessToken) return;

    loadHistory();

    // Setup SSE
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const sseUrl = `${baseUrl}/notifications/stream`;
    
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
          throw new Error('No se pudo conectar al stream SSE');
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
                const newNotif: Notification = JSON.parse(dataStr);
                
                // Agregar al top de notificaciones
                setNotifications(prev => {
                  if (prev.some(n => n.id === newNotif.id)) return prev;
                  return [newNotif, ...prev];
                });

                // Mostrar Toast
                toast.info(newNotif.title, {
                  description: newNotif.message,
                });
              } catch (e) {
                console.error('Error parsing SSE event', e);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('SSE Error (intentando reconectar en 5s)...', err);
          setTimeout(connectSSE, 5000);
        }
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [_hasHydrated, isAuthenticated, accessToken]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      // Ignorar error de red y mantener UI optimista
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
    } catch (e) {
    }
  };

  if (!_hasHydrated || !isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#161616] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 flex flex-col max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#111]">
            <h3 className="font-bold text-gray-900 dark:text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent">
                Marcar todas leídas
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl transition-colors cursor-pointer flex gap-3 items-start ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'}`}
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                  >
                    {!n.read && (
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                    )}
                    <div className="flex-1">
                      <h4 className={`text-sm ${!n.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
