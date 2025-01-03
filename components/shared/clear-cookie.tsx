'use client';

import { useEffect } from 'react';

export function ClearCookie() {
  useEffect(() => {
    fetch('/api/wallet/clear-cookie').catch(console.error);
  }, []);

  return null;
}
