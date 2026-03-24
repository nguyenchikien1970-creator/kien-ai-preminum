// KIEN AI Premium Chatbot Logic v3.1 - Robust SDK Integration
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];
const CUSTOM_API_CONFIG = {
    apiKey: "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
    baseURL: "https://9router.vuhai.io.vn/v1",
    model: "ces-chatbot-gpt-5.4"
};

const SYSTEM_PROMPT = `Bạn là trợ lý ảo cao cấp của KIEN AI Consulting. 
Phong cách: Chuyên nghiệp, am hiểu sâu sắc về Trí tuệ Nhân tạo, lịch sự, công cụ này chạy trên model ces-chatbot-gpt-5.4 qua 9router.
Bạn trả lời các câu hỏi về dịch vụ của KIEN AI. Hãy giữ câu trả lời ngắn gọn, súc tích.`;

// Attach listener immediately to prevent page reload even if SDK fails
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        chatInput.value = '';
        setLoading(true);

        try {
            const botResponse = await callAI(message);
            addMessage('bot', botResponse);
        } catch (error) {
            console.error('Chatbot Error:', error);
            addMessage('bot', 'Lỗi hệ thống: ' + error.message);
        } finally {
            setLoading(false);
        }
    });
}

async function callAI(message) {
    // Attempt to use OpenAI SDK if available
    if (typeof OpenAI !== 'undefined') {
        try {
            const openai = new OpenAI({
                apiKey: CUSTOM_API_CONFIG.apiKey,
                baseURL: CUSTOM_API_CONFIG.baseURL,
                dangerouslyAllowBrowser: true
            });
            const response = await openai.chat.completions.create({
                model: CUSTOM_API_CONFIG.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...chatHistory.slice(-6).map(m => ({ 
                        role: m.role === 'bot' ? 'assistant' : 'user', 
                        content: m.text 
                    })),
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            });
            return response.choices[0].message.content;
        } catch (sdkError) {
            console.warn('SDK failed, falling back to Fetch:', sdkError);
        }
    }

    // Fallback to Fetch (Standard OpenAI-compatible API call)
    const response = await fetch(`${CUSTOM_API_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CUSTOM_API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            model: CUSTOM_API_CONFIG.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatHistory.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
                { role: 'user', content: message }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.choices[0].message.content;
}

function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`;
    messageDiv.innerHTML = `
        <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${role === 'bot' ? 'bg-primary/20 border-primary/20 shadow-inner' : 'bg-white border-white'}">
            <span class="material-symbols-outlined ${role === 'bot' ? 'text-primary' : 'text-surface'} text-xl">${role === 'bot' ? 'bolt' : 'person'}</span>
        </div>
        <div class="max-w-[80%] p-5 rounded-[1.5rem] ${role === 'bot' ? 'bg-white/5 border border-white/10' : 'bg-primary text-surface font-bold'} text-sm leading-relaxed shadow-2xl backdrop-blur-md">
            ${text}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatHistory.push({ role, text });
}

function setLoading(isLoading) {
    if (!sendBtn) return;
    if (isLoading) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<div class="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>';
    } else {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span class="material-symbols-outlined text-2xl font-bold">arrow_upward</span>';
    }
}

function clearChat() {
    chatMessages.innerHTML = '';
    chatHistory = [];
    addMessage('bot', 'Hệ thống đã được khởi động lại.');
}
