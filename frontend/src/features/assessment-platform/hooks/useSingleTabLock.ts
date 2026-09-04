import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSingleTabLockProps {
  isActive: boolean;
}

export function useSingleTabLock({ isActive }: UseSingleTabLockProps) {
  const [isLockedByAnotherTab, setIsLockedByAnotherTab] = useState(false);
  const [otherTabsDetected, setOtherTabsDetected] = useState(false);
  const tabIdRef = useRef<string>(`tab_${Math.random().toString(36).substring(2, 9)}`);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Send signal to close / lock all other tabs
  const enforceSingleTab = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        if (!channelRef.current) {
          channelRef.current = new BroadcastChannel('vidyut_exam_channel');
        }
        channelRef.current.postMessage({
          type: 'ENFORCE_EXCLUSIVE_TAB',
          activeTabId: tabIdRef.current,
        });
      }
      localStorage.setItem('vidyut_exam_active_tab', tabIdRef.current);
      localStorage.setItem('vidyut_exam_active_time', Date.now().toString());
    } catch (e) {
      console.warn('BroadcastChannel not supported or storage restricted:', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('vidyut_exam_channel');
        channelRef.current = channel;

        // Ping to see if other tabs exist
        channel.postMessage({
          type: 'PING_CHECK_TABS',
          senderTabId: tabIdRef.current,
        });

        channel.onmessage = (event) => {
          const { type, activeTabId, senderTabId } = event.data || {};

          // If another tab pinged, let them know we exist
          if (type === 'PING_CHECK_TABS' && senderTabId !== tabIdRef.current) {
            setOtherTabsDetected(true);
            channel.postMessage({
              type: 'PONG_TAB_EXISTS',
              senderTabId: tabIdRef.current,
            });
          }

          if (type === 'PONG_TAB_EXISTS' && senderTabId !== tabIdRef.current) {
            setOtherTabsDetected(true);
          }

          // If another tab started the exam, lock this tab!
          if (type === 'ENFORCE_EXCLUSIVE_TAB' && activeTabId !== tabIdRef.current) {
            setIsLockedByAnotherTab(true);
            try {
              window.close();
            } catch {
              // window.close() may be blocked by browser if not opened by script
            }
          }
        };
      }
    } catch (e) {
      console.warn('Single tab listener init error:', e);
    }

    // Also listen to storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vidyut_exam_active_tab' && e.newValue && e.newValue !== tabIdRef.current) {
        if (isActive) {
          setIsLockedByAnotherTab(true);
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [isActive]);

  return {
    isLockedByAnotherTab,
    otherTabsDetected,
    enforceSingleTab,
  };
}
