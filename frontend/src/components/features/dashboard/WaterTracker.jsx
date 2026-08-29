import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../../ui/Card';
import { requestNotificationPermission, showLocalNotification } from '../../../utils/pwaUtils';
import { addLocalNotification } from '../../../api/notifications.api';
import { useUIStore } from '../../../store/uiStore';

export const WaterTracker = ({ glasses = 6, onToggleGlass, userWeight = 70 }) => {
  const weight = Number(userWeight) || 70;
  // Clinical & Ayurvedic hydration formula: 35 ml per kg body weight
  const targetWaterMl = Math.round(weight * 35);
  const glassSizeMl = 250; // Standard 250ml water glass
  const totalGlasses = Math.max(4, Math.ceil(targetWaterMl / glassSizeMl));

  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('nutrivedic_water_count');
    return saved !== null ? parseInt(saved, 10) : glasses;
  });

  const [reminderActive, setReminderActive] = useState(() => {
    return localStorage.getItem('nutrivedic_water_reminder') === 'true';
  });

  const [intervalMinutes, setIntervalMinutes] = useState(() => {
    const saved = localStorage.getItem('nutrivedic_water_interval');
    return saved !== null ? parseFloat(saved) : 30;
  });

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const intervalOptions = [
    { value: 0.166, label: '10s (Demo)', badge: '⚡ FAST' },
    { value: 0.5, label: '30s (Demo)', badge: '⚡ FAST' },
    { value: 1, label: '1 min', badge: 'DEMO' },
    { value: 15, label: '15 min', badge: null },
    { value: 30, label: '30 min', badge: 'POPULAR' },
    { value: 45, label: '45 min', badge: null },
    { value: 60, label: '60 min', badge: null }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (glasses !== undefined && localStorage.getItem('nutrivedic_water_count') === null) {
      setCount(glasses);
    }
  }, [glasses]);

  // Live countdown timer effect
  useEffect(() => {
    let timer = null;
    if (reminderActive) {
      const totalSecs = Math.round(intervalMinutes * 60);
      setSecondsRemaining((prev) => (prev > 0 && prev <= totalSecs ? prev : totalSecs));

      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            const title = '💧 Hydration Reminder';
            const body = 'Time to hydrate! Drink at least 500ml of water to stay fresh, focused, and energized.';
            
            // 1. Add to Notifications Inbox (/notifications)
            addLocalNotification(title, body);
            queryClient.invalidateQueries(['notifications']);

            // 2. Trigger OS Desktop Notification
            showLocalNotification(title, {
              body,
              tag: 'water-reminder'
            });

            // 3. Show In-App Toast
            addToast('💧 Reminder: Drink at least 500ml of water!', 'info');
            return Math.round(intervalMinutes * 60);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSecondsRemaining(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [reminderActive, intervalMinutes, queryClient, addToast]);

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    localStorage.setItem('nutrivedic_water_count', nextCount.toString());
    if (onToggleGlass) onToggleGlass(nextCount);
  };

  const handleDecrement = () => {
    if (count > 0) {
      const nextCount = count - 1;
      setCount(nextCount);
      localStorage.setItem('nutrivedic_water_count', nextCount.toString());
      if (onToggleGlass) onToggleGlass(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    localStorage.setItem('nutrivedic_water_count', '0');
    if (onToggleGlass) onToggleGlass(0);
  };

  const handleSelectInterval = (val) => {
    setIntervalMinutes(val);
    localStorage.setItem('nutrivedic_water_interval', val.toString());
    setDropdownOpen(false);
    if (reminderActive) {
      setSecondsRemaining(Math.round(val * 60));
      addToast(`Reminder interval set to ${getIntervalLabel(val)}`, 'info');
    }
  };

  const getIntervalLabel = (mins) => {
    if (mins < 1) return `${Math.round(mins * 60)}s (Demo)`;
    return `${mins} min`;
  };

  const formatCountdown = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleReminder = async () => {
    if (!reminderActive) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setReminderActive(true);
        setSecondsRemaining(Math.round(intervalMinutes * 60));
        localStorage.setItem('nutrivedic_water_reminder', 'true');
        addToast(`🔔 Hydration reminder active! Next in ${getIntervalLabel(intervalMinutes)}`, 'success');
      } else {
        addToast('Please allow browser notifications in settings to receive reminders.', 'error');
      }
    } else {
      setReminderActive(false);
      localStorage.setItem('nutrivedic_water_reminder', 'false');
      addToast('Water reminders paused', 'info');
    }
  };

  const handleTestNotification = async () => {
    const perm = await requestNotificationPermission();
    const title = '💧 Hydration Reminder';
    const body = 'Drink at least 500ml of water now! Boosts energy & healthy hydration.';

    // 1. Add to Notifications Inbox (/notifications)
    addLocalNotification(title, body);
    queryClient.invalidateQueries(['notifications']);

    if (perm === 'granted') {
      showLocalNotification(title, {
        body,
        icon: '/icons/icon-192.png'
      });
      addToast('⚡ Sent Test Alert: "Drink 500ml water"', 'success');
    } else {
      addToast('💧 Added to Notifications tab! (Enable browser notifications for desktop alerts)', 'info');
    }
  };

  return (
    <Card className="flex flex-col justify-between relative">
      {/* Header Row with Reset Button */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          HYDRATION LOG
        </span>
        {count > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="font-mono text-[11px] text-muted hover:text-black transition-colors cursor-pointer"
          >
            Reset counter
          </button>
        )}
      </div>

      {/* Counter Widget */}
      <div className="bg-black text-white rounded-[20px] p-4 flex items-center justify-between relative overflow-hidden my-1 select-none">
        {/* Subtle background concentric circles */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        {/* Left: Label + Large Count Number */}
        <div className="flex flex-col z-10">
          <span className="font-sans text-xs text-[#9e9e9e] font-medium">Water</span>
          <span className="font-serif text-[38px] font-bold text-white leading-none mt-1">
            {count}
          </span>
        </div>

        {/* Right: Interactive +1 & Decrement Buttons */}
        <div className="flex items-center gap-2 z-10">
          {count > 0 && (
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease water count"
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
            >
              -1
            </button>
          )}
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Add 1 glass of water"
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white text-black font-sans font-bold text-base flex items-center justify-center shadow hover:bg-surface active:scale-90 transition-all cursor-pointer"
          >
            +1
          </button>
        </div>
      </div>

      {/* Progress & Target Summary */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted mt-2 mb-3">
        <span>{count} of {totalGlasses} glasses (250 ml/ea)</span>
        <span className="font-medium text-black">{count * glassSizeMl} / {targetWaterMl.toLocaleString()} ml</span>
      </div>

      {/* Interactive Reminder Bar */}
      <div className="pt-3 border-t border-border flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Custom Styled Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-label uppercase">Every:</span>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 bg-surface hover:bg-[#eaeaea] border border-border rounded-lg px-2.5 py-1 font-mono text-[11px] text-black font-medium transition-colors cursor-pointer"
              >
                <span>{getIntervalLabel(intervalMinutes)}</span>
                <svg
                  className={`w-3 h-3 text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Custom Dropdown Menu Popover */}
            {dropdownOpen && (
              <div className="absolute left-0 bottom-full mb-1.5 w-44 bg-white border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-border bg-surface/50 font-mono text-[9px] text-label uppercase tracking-wider">
                  Select Interval
                </div>
                {intervalOptions.map((opt) => {
                  const isSelected = Math.abs(intervalMinutes - opt.value) < 0.01;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectInterval(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left font-mono text-[11px] transition-colors cursor-pointer ${
                        isSelected ? 'bg-black text-white font-semibold' : 'text-black hover:bg-surface'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`text-[8px] px-1 py-0.2 rounded font-sans uppercase font-bold tracking-tight ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTestNotification}
              title="Trigger instant notification to demonstrate to judges"
              className="font-mono text-[11px] px-2.5 py-1 bg-white hover:bg-surface text-black rounded-lg border border-border shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              ⚡ Test
            </button>

            <button
              type="button"
              onClick={handleToggleReminder}
              className={`font-mono text-[11px] px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap border ${
                reminderActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-black text-white border-black hover:bg-neutral-800'
              }`}
            >
              {reminderActive ? '🔔 Active' : 'Start'}
            </button>
          </div>
        </div>

        {/* Live Countdown & Visual Indicator */}
        {reminderActive && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-800 uppercase font-medium">
                Live Scheduler
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-emerald-900">
              Next alert in {formatCountdown(secondsRemaining)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
