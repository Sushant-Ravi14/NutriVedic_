import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { renderNavIcon } from './Sidebar';
import { useNotifications } from '../../hooks/useNotifications';

export const BottomNav = () => {
  const location = useLocation();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => n.unread).length;

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', svgType: 'dashboard' },
    { label: 'Scan', path: '/scan', svgType: 'camera' },
    { label: 'Log', path: '/food-log', svgType: 'food' },
    { label: 'Plan', path: '/diet-plan', svgType: 'diet' },
    { label: 'Alerts', path: '/notifications', svgType: 'notifications', badge: unreadCount },
    { label: 'Profile', path: '/settings', svgType: 'settings' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border h-[62px] pb-[env(safe-area-inset-bottom)] flex items-center justify-around select-none shadow-sm">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const fill = isActive ? '#0a0a0a' : '#9e9e9e';

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${
              isActive ? 'text-black font-semibold' : 'text-label'
            }`}
          >
            <div className="relative">
              {renderNavIcon(tab.svgType, fill, 'w-5 h-5')}
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-2.5 px-1 min-w-[15px] h-[15px] text-[9px] font-mono font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span className="font-sans text-[10px] leading-none">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
