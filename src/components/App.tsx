import React, { ReactNode } from 'react'
import AppHeader from '@/components/AppHeader'

interface AppProps {
  title?: string | null;
  className?: string;
  children: ReactNode;
}

export default function App({
  title = null,
  className = '',
  children
}: AppProps) {
  return (
    <div className={`App ${className}`}>
      <AppHeader title={title} />
      {children}
    </div>
  );
}

