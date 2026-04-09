import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../api/axiosInstance';
import styles from './Chatbot.module.css';

const INITIAL_OPTIONS = [
  '1. Fitness / Health',
  '2. Diabetic Diet',
  '3. Cooking / Recipes'
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: 'Hi! I can help you pick the best microgreens. Which goal are you interested in today?',
        sender: 'bot',
        isOptions: true,
        options: INITIAL_OPTIONS,
      },
    ]);
  };

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      initChat();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const buildHistory = () =>
    messages
      .filter((msg) => !msg.isOptions)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text,
      }));

  const handleSendMessage = async (textToSubmit = inputMessage) => {
    const text = textToSubmit.trim();
    if (!text || isTyping) return;

    setMessages((prev) => prev.map((msg) => ({ ...msg, isOptions: false })));

    const nextUserMessage = { id: Date.now(), text, sender: 'user' };
    const history = buildHistory();

    setMessages((prev) => [...prev, nextUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/generate', {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.data.reply,
          sender: 'bot',
        },
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text:
            error.response?.data?.detail ||
            'Sorry, the AI assistant is unavailable right now. Please try again later.',
          sender: 'bot',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (optionText) => {
    handleSendMessage(optionText);
  };

  return (
    <div className={styles.chatbotContainer}>
      {isOpen ? (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <Bot className={styles.botIcon} size={24} />
              <div>
                <h3 className={styles.title}>Uzhavar AI Guide</h3>
                <p className={styles.status}>Online</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  styles.messageWrapper,
                  msg.sender === 'user' ? styles.userWrapper : styles.botWrapper,
                ].join(' ')}
              >
                <div
                  className={[
                    styles.message,
                    msg.sender === 'user' ? styles.userMessage : styles.botMessage,
                  ].join(' ')}
                >
                  {msg.text}
                </div>
                {msg.isOptions && msg.options && (
                  <div className={styles.optionsContainer}>
                    {msg.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={styles.optionBtn}
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className={[styles.messageWrapper, styles.botWrapper].join(' ')}>
                <div className={[styles.message, styles.botMessage, styles.typingIndicator].join(' ')}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.toggleBtn} onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
