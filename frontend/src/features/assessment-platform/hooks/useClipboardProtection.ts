import { useState, useEffect, useCallback, useRef } from 'react';

interface UseClipboardProtectionProps {
  isActive?: boolean;
}

export function useClipboardProtection({ isActive = true }: UseClipboardProtectionProps) {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerWarning = useCallback((msg: string) => {
    setWarningMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setWarningMessage(null);
    }, 2800);
  }, []);

  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // 1. Prevent copy event
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning('Copying text and code is strictly disabled during the assessment.');
    };

    // 2. Prevent cut event
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning('Cutting content is disabled during the assessment.');
    };

    // 3. Prevent paste event
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning('Pasting content is disabled during the assessment.');
    };

    // 4. Prevent right-click context menu (blocks 'Inspect Element')
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('Inspect Element and context menus are prohibited.');
    };

    // 5. Prevent drag-selection of text
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // 6. Block inspect keyboard shortcuts (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block copy (Ctrl+C / Cmd+C)
      if (isCtrlOrMeta && key === 'c' && !e.shiftKey) {
        e.preventDefault();
        triggerWarning('Copying text and code is strictly disabled.');
        return;
      }

      // Block paste (Ctrl+V / Cmd+V)
      if (isCtrlOrMeta && key === 'v') {
        e.preventDefault();
        triggerWarning('Pasting content is disabled.');
        return;
      }

      // Block cut (Ctrl+X / Cmd+X)
      if (isCtrlOrMeta && key === 'x') {
        e.preventDefault();
        triggerWarning('Cutting content is disabled.');
        return;
      }

      // Block select all (Ctrl+A / Cmd+A)
      if (isCtrlOrMeta && key === 'a') {
        e.preventDefault();
        triggerWarning('Select all is disabled.');
        return;
      }

      // Block print / save to PDF (Ctrl+P / Cmd+P)
      if (isCtrlOrMeta && key === 'p') {
        e.preventDefault();
        triggerWarning('Printing examination pages is disabled.');
        return;
      }

      // Block view source (Ctrl+U / Cmd+U)
      if (isCtrlOrMeta && key === 'u') {
        e.preventDefault();
        triggerWarning('Viewing page source is prohibited.');
        return;
      }

      // Block DevTools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (isCtrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))
      ) {
        e.preventDefault();
        triggerWarning('Developer Tools & Element Inspection are prohibited.');
        setIsDevToolsOpen(true);
        return;
      }
    };

    // 7. Polling DevTools Open Detection (Window Dimension delta method)
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    const devToolsInterval = setInterval(checkDevTools, 800);

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(devToolsInterval);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [isActive, triggerWarning]);

  return {
    warningMessage,
    isDevToolsOpen,
    setIsDevToolsOpen,
  };
}
