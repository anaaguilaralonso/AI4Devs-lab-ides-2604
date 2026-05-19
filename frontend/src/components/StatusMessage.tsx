import React from 'react';

interface StatusMessageProps {
  variant: 'success' | 'error';
  title: string;
  children?: React.ReactNode;
}

export default function StatusMessage({
  variant,
  title,
  children,
}: StatusMessageProps) {
  return (
    <div className={`status-message status-message--${variant}`} role="alert" aria-live="polite">
      <p className="status-message__title">{title}</p>
      {children ? <div className="status-message__body">{children}</div> : null}
    </div>
  );
}
