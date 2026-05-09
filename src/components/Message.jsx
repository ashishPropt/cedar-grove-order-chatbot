import React from 'react';
import './Message.css';

export default function Message({ role, text }) {
  return (
    <div className={`message message--${role}`}>
      {role === 'bot' && (
        <div className="message__avatar">CG</div>
      )}
      <div className="message__bubble">{text}</div>
    </div>
  );
}
