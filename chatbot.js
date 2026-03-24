// KIEN AI Premium Chatbot Logic v1.0
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

const SYSTEM_PROMPT = `Bạn là trợ lý ảo cao cấp của KIEN AI Consulting. 
Phong cách: Chuyên nghiệp, am hiểu sâu sắc về Trí tuệ Nhân tạo (LLM, RAG, AI Ops), lịch sự, sang trọng và có phần hơi mang tương lai (futuristic/tech-savvy).
Bạn trả lời các câu hỏi về dịch vụ của KIEN AI (Tư vấn chiến lược AI, Tích hợp LLM doanh nghiệp, AI Agents). 
Hãy giữ câu trả lời ngắn gọn, súc tích và khơi gợi sự tò mò của khách hàng về các giải pháp cao cấp. 
Nếu được hỏi về kỹ thuật, hãy trả lời chính xác nhưng dễ hiểu cho các lãnh đạo doanh nghiệp.`;

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    const apiKey = localStorage.getItem('KIEN_AI_KEY');
    const apiType = localStorage.getItem('KIEN_AI_TYPE') || 'openai';

    if (!message) return;

    if (!apiKey) {
        addMessage('bot', 'Vui lòng cấu hình API Key trong mục "API Config" để kích hoạt trí tuệ nhân tạo của tôi.');
        openApiKeyModal();
        return;
    }

    // Add user message to UI
    addMessage('user', message);
    chatInput.value = '';
    
    // Set loading state
    setLoading(true);

    try {
        let botResponse = '';
        if (apiType === 'openai') {
            botResponse = await callOpenAI(apiKey, message);
        } else {
            botResponse = await callGemini(apiKey, message);
        }
        addMessage('bot', botResponse);
    } catch (error) {
        console.error('Chatbot Error:', error);
        addMessage('bot', 'Đã xảy ra lỗi khi kết nối với hệ thống Core của tôi. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.');
    } finally {
        setLoading(false);
    }
});

function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`;
    
    const icon = role === 'bot' ? 'bolt' : 'person';
    const bgClass = role === 'bot' ? 'bg-white/5 border border-white/10' : 'bg-primary text-surface font-bold';
    const iconClass = role === 'bot' ? 'text-primary' : 'text-surface';

    messageDiv.innerHTML = `
        <div class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${role === 'bot' ? 'bg-primary/20 border-primary/20 shadow-inner' : 'bg-white border-white'}">
            <span class="material-symbols-outlined ${role === 'bot' ? 'text-primary' : 'text-surface'} text-xl">${icon}</span>
        </div>
        <div class="max-w-[80%] p-5 rounded-[1.5rem] ${bgClass} text-sm leading-relaxed shadow-2xl backdrop-blur-md">
            ${text}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    chatHistory.push({ role, text });
}

function setLoading(isLoading) {
    if (isLoading) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<div class="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>';
    } else {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span class="material-symbols-outlined text-2xl font-bold">arrow_upward</span>';
    }
}

async function callOpenAI(key, message) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...chatHistory.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
                { role: 'user', content: message }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function callGemini(key, message) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                { role: 'user', parts: [{ text: "System Context: " + SYSTEM_PROMPT }] },
                ...chatHistory.slice(-4).map(m => ({ 
                    role: m.role === 'user' ? 'user' : 'model', 
                    parts: [{ text: m.text }] 
                })),
                { role: 'user', parts: [{ text: message }] }
            ]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
}

function clearChat() {
    chatMessages.innerHTML = '';
    chatHistory = [];
    addMessage('bot', 'Dữ liệu phiên làm việc đã được xóa. Tôi sẵn sàng cho thử thách mới.');
}
