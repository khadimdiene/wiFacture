"use client";

import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Convert pathname to breadcrumb
  const pathParts = pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Hamburger Menu Toggle */}
      {onMenuClick && (
        <button
          type="button"
          className="mr-2 p-2 text-gray-500 md:hidden hover:bg-gray-50 rounded-md transition-all active:scale-95 duration-200"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
          <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
            <span>WiFacture</span>
            <span className="text-gray-300">&gt;</span>
            <span className="capitalize">{title}</span>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
          <button 
            type="button" 
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md transition-all duration-200 hover:shadow-sm active:scale-95 hover:border-gray-300"
          >
            <span className="sr-only">Search</span>
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md relative transition-all duration-200 hover:shadow-sm active:scale-95 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 hover:bg-sky-50/30 transition-colors cursor-pointer ${!notif.read ? 'bg-sky-50/10' : ''}`}
                          onClick={() => {
                            setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-sky-500' : 'bg-transparent'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1.5">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      Aucune notification
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-sm font-semibold text-gray-900 hover:text-sky-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
