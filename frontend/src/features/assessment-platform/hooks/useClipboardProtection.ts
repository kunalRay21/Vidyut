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

    // 4. Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('Right-click context menu is disabled for examination security.');
    };

    // 5. Prevent drag-selection of text
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow select only if explicitly inside an input/textarea if needed
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    // 6. Block keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+U, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block copy (Ctrl+C / Cmd+C)
      if (isCtrlOrMeta && key === 'c') {
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
        triggerWarning('Viewing page source is disabled.');
        return;
      }

      // Block inspect / DevTools (F12 or Ctrl+Shift+I)
      if (e.key === 'F12' || (isCtrlOrMeta && e.shiftKey && key === 'i')) {
        e.preventDefault();
        triggerWarning('Developer tools shortcut is disabled during the assessment.');
        return;
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
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

  return { warningMessage };
}
