(function() {
    // Determine the host script URL and bot_id
    let currentScript = document.currentScript;
    if (!currentScript) {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src.includes('/widget/widget.js') || scripts[i].hasAttribute('data-bot-id')) {
                currentScript = scripts[i];
                break;
            }
        }
    }
    const botId = currentScript ? (currentScript.getAttribute('data-bot-id') || 'unknown') : 'unknown';
    const primaryColor = '#4f46e5';
    const botName = 'BrainSync AI';
    const welcomeMsg = 'Hi there! 👋 I\'m powered by BrainSync AI. How can I help you today?';
    
    const scriptSrc = currentScript ? currentScript.src : '';
    const baseUrl = scriptSrc ? scriptSrc.split('/widget/widget.js')[0] : 'http://localhost:8000';

    // Create Widget Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ai-chatbot-widget-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5, #c026d3);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
            z-index: 999999;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ai-chatbot-widget-btn:hover {
            transform: scale(1.08) translateY(-5px);
            box-shadow: 0 15px 35px rgba(79, 70, 229, 0.7);
        }
        .ai-chatbot-widget-btn svg {
            width: 34px;
            height: 34px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .ai-chatbot-window {
            position: fixed;
            bottom: 120px;
            right: 30px;
            width: 400px;
            height: 650px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            transform: translateY(30px) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .ai-chatbot-window.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        .ai-chatbot-header {
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            color: #f8fafc;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 18px;
            letter-spacing: -0.5px;
        }

        .ai-chatbot-header-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ai-chatbot-header-title svg {
            width: 24px;
            height: 24px;
            color: #c026d3;
            filter: drop-shadow(0 0 8px rgba(192, 38, 211, 0.5));
        }

        .ai-chatbot-header-close {
            cursor: pointer;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            transition: all 0.3s ease;
        }
        
        .ai-chatbot-header-close:hover {
            background: rgba(255,255,255,0.15);
            transform: rotate(90deg);
        }

        .ai-chatbot-messages {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        /* Custom Scrollbar */
        .ai-chatbot-messages::-webkit-scrollbar {
            width: 6px;
        }
        .ai-chatbot-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        .ai-chatbot-messages::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }

        .ai-message {
            max-width: 85%;
            padding: 14px 18px;
            border-radius: 18px;
            font-size: 15px;
            line-height: 1.5;
            color: #f8fafc;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .ai-message.bot {
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255,255,255,0.05);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .ai-message.user {
            background: linear-gradient(135deg, #4f46e5, #c026d3);
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .ai-chatbot-input-area {
            padding: 20px 24px;
            background: rgba(255, 255, 255, 0.02);
            border-top: 1px solid rgba(255,255,255,0.08);
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .ai-chatbot-input-area input {
            flex: 1;
            padding: 14px 20px;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.1);
            color: #f8fafc;
            border-radius: 24px;
            outline: none;
            font-size: 15px;
            transition: all 0.3s ease;
        }
        
        .ai-chatbot-input-area input::placeholder {
            color: #64748b;
        }

        .ai-chatbot-input-area input:focus {
            border-color: #c026d3;
            box-shadow: 0 0 0 3px rgba(192, 38, 211, 0.2);
        }

        .ai-chatbot-send-btn {
            background: linear-gradient(135deg, #4f46e5, #c026d3);
            color: white;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            flex-shrink: 0;
        }

        .ai-chatbot-send-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 16px rgba(192, 38, 211, 0.4);
        }

        .ai-chatbot-send-btn svg {
            width: 22px;
            height: 22px;
            margin-left: 2px;
        }
        
        /* Typing indicator */
        .typing-indicator {
            display: flex;
            gap: 6px;
            padding: 12px 16px;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            width: fit-content;
        }
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #c026d3;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Create Widget Button
    const button = document.createElement('div');
    button.className = 'ai-chatbot-widget-btn';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.64 5.23a.75.75 0 0 1 1.42 0l1.2 3.8a4.5 4.5 0 0 0 3.1 3.1l3.8 1.2a.75.75 0 0 1 0 1.42l-3.8 1.2a4.5 4.5 0 0 0-3.1 3.1l-1.2 3.8a.75.75 0 0 1-1.42 0l-1.2-3.8a4.5 4.5 0 0 0-3.1-3.1l-3.8-1.2a.75.75 0 0 1 0-1.42l3.8-1.2a4.5 4.5 0 0 0 3.1-3.1l1.2-3.8Z" />
          <path d="M4.14 3.73a.5.5 0 0 1 .92 0l.4 1.26a1.5 1.5 0 0 0 1.03 1.03l1.26.4a.5.5 0 0 1 0 .92l-1.26.4a1.5 1.5 0 0 0-1.03 1.03l-.4 1.26a.5.5 0 0 1-.92 0l-.4-1.26a1.5 1.5 0 0 0-1.03-1.03l-1.26-.4a.5.5 0 0 1 0-.92l1.26-.4a1.5 1.5 0 0 0 1.03-1.03l.4-1.26Z" />
        </svg>
    `;
    document.body.appendChild(button);

    // Create Chat Window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chatbot-window';
    chatWindow.innerHTML = `
        <div class="ai-chatbot-header">
            <div class="ai-chatbot-header-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.64 5.23a.75.75 0 0 1 1.42 0l1.2 3.8a4.5 4.5 0 0 0 3.1 3.1l3.8 1.2a.75.75 0 0 1 0 1.42l-3.8 1.2a4.5 4.5 0 0 0-3.1 3.1l-1.2 3.8a.75.75 0 0 1-1.42 0l-1.2-3.8a4.5 4.5 0 0 0-3.1-3.1l-3.8-1.2a.75.75 0 0 1 0-1.42l3.8-1.2a4.5 4.5 0 0 0 3.1-3.1l1.2-3.8Z" /></svg>
                BrainSync AI
            </div>
            <button class="ai-chatbot-header-close">×</button>
        </div>
        <div class="ai-chatbot-messages" id="ai-chat-messages">
            <div class="ai-message bot">Hi there! 👋 I'm powered by BrainSync AI. How can I help you today? / আমি প্রস্তুত! আপনার কি জানার আছে?</div>
        </div>
        <div class="ai-chatbot-input-area">
            <input type="text" id="ai-chat-input" placeholder="Message AI..." autocomplete="off">
            <button class="ai-chatbot-send-btn" id="ai-chat-send">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // Toggle Chat Window
    button.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });

    const closeBtn = chatWindow.querySelector('.ai-chatbot-header-close');
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Chat Logic
    const messagesContainer = document.getElementById('ai-chat-messages');
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-message bot typing-indicator-container';
        msgDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        msgDiv.id = 'typing-indicator';
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        inputField.value = '';
        showTypingIndicator();

        try {
            const response = await fetch(`${baseUrl}/api/chat/${botId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            removeTypingIndicator();
            appendMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Chat Error:', error);
            removeTypingIndicator();
            appendMessage('Error: Cannot connect to the server right now.', 'bot');
        }
    }

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

})();
