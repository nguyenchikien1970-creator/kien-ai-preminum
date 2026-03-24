// KIEN AI Premium Chatbot Logic v3.0 - Using Official OpenAI SDK
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

// Cấu hình API tùy chỉnh theo yêu cầu của người dùng
const CUSTOM_API_CONFIG = {
    apiKey: "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
    baseURL: "https://9router.vuhai.io.vn/v1",
    model: "ces-chatbot-gpt-5.4"
};

const SYSTEM_PROMPT = `Bạn là trợ lý ảo cao cấp của KIEN AI Consulting. 
Phong cách: Chuyên nghiệp, am hiểu sâu sắc về Trí tuệ Nhân tạo, lịch sự, công cụ này chạy trên model ces-chatbot-gpt-5.4 qua 9router.
Bạn trả lời các câu hỏi về dịch vụ của KIEN AI (Tư vấn chiến lược AI, Tích hợp LLM doanh nghiệp, AI Agents). 
Hãy giữ câu trả lời ngắn gọn, súc tích và khơi gợi sự tò mò của khách hàng về các giải pháp cao cấp.`;

// Khởi tạo OpenAI SDK Client bằng cách ghi đè baseURL
// Lưu ý: dangerouslyAllowBrowser là bắt buộc khi sử dụng SDK trực tiếp tại frontend
const openai = new OpenAI({
    apiKey: CUSTOM_API_CONFIG.apiKey,
    baseURL: CUSTOM_API_CONFIG.baseURL,
    dangerouslyAllowBrowser: true
});

async function callCustomAI(message) {
    try {
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
    } catch (error) {
        throw new Error(error.message || 'Lỗi kết nối SDK');
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Hiển thị tin nhắn người dùng
    addMessage('user', message);
    chatInput.value = '';
    
    // Bật trạng thái loading
    setLoading(true);

    try {
        const botResponse = await callCustomAI(message);
        addMessage('bot', botResponse);
    } catch (error) {
        console.error('Chatbot SDK Error:', error);
        addMessage('bot', 'Xin lỗi, hệ thống trí tuệ nhân tạo đang gặp sự cố kết nối qua OpenAI SDK. Chi tiết: ' + error.message);
    } finally {
        setLoading(false);
    }
});

function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`;
    
    const icon = role === 'bot' ? 'bolt' : 'person';
    const bgClass = role === 'bot' ? 'bg-white/5 border border-white/10' : 'bg-primary text-surface font-bold';

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
    
    // Lưu lịch sử hội thoại
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

function clearChat() {
    chatMessages.innerHTML = '';
    chatHistory = [];
    addMessage('bot', 'Dữ liệu phiên làm việc đã được làm mới qua OpenAI SDK.');
}
