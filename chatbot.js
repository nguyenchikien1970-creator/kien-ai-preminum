// KIEN AI Premium Chatbot Logic v4.0 - Lead Capture + Google Sheets Integration

// ============================================================
// CẤU HÌNH GOOGLE SHEETS LEAD CAPTURE
// ============================================================
// URL Google Apps Script Web App (thay YOUR_DEPLOY_ID bằng URL thật sau khi deploy)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlty5iZc8zkkKQgjCIEYm8f3Trojm-VZg9o3Xbsoimwsxak49k4USVE0J9YtzNWeoW/exec';

// Tạo Session ID duy nhất cho mỗi phiên tải trang
const AI_CHAT_SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
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
Bạn trả lời các câu hỏi về dịch vụ của KIEN AI. Hãy giữ câu trả lời ngắn gọn, súc tích.

Quy tắc đặc biệt: Trong quá trình trò chuyện, nếu bạn phát hiện người dùng cung cấp Tên, Số điện thoại hoặc Email, bạn HÃY VỪA trả lời họ bình thường, VỪA chèn thêm một đoạn mã JSON vào cuối cùng của câu trả lời theo đúng định dạng sau:
||LEAD_DATA: {"name": "...", "phone": "...", "email": "..."}||
Nếu thông tin nào chưa có, hãy để null.
TUYỆT ĐỐI KHÔNG giải thích hay đề cập đến đoạn mã này cho người dùng.`;

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
            let botResponse = await callAI(message);
            // Bóc tách lead data trước khi hiển thị cho khách
            botResponse = processAIResponse(botResponse, chatHistory);
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
        <div class="max-w-[80%] p-5 rounded-[1.5rem] ${role === 'bot' ? 'bg-white/5 border border-white/10 text-white' : 'bg-primary text-surface font-bold'} text-sm leading-relaxed shadow-2xl backdrop-blur-md">
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

// ============================================================
// HÀM BÓC TÁCH DỮ LIỆU LEAD TỪ CÂU TRẢ LỜI CỦA AI VÀ LƯU TRỮ
// ============================================================

/**
 * Hàm xử lý response từ AI:
 * 1. Kiểm tra có tag ||LEAD_DATA:...|| không
 * 2. Nếu có → Parse JSON → Gửi lên Google Sheets kèm Lịch sử Chat & Session ID
 * 3. Xóa tag khỏi câu trả lời → Hiển thị sạch cho khách
 */
function processAIResponse(aiResponse, chatHistoryArray = []) {
    const dataPattern = /\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/;

    // Xây dựng Text Lịch sử Chat cho dễ đọc trên Google Sheets
    let formattedHistory = "";
    if (chatHistoryArray && chatHistoryArray.length > 0) {
        formattedHistory = chatHistoryArray.map(msg => {
            let role = msg.role === 'user' ? 'Khách' : 'AI';
            // Lọc bỏ tag ẩn trước khi lưu vào Google Sheets
            let content = msg.text.replace(dataPattern, "").trim();
            return `${role}: ${content}`;
        }).join('\n\n');
    }

    if (aiResponse.includes("||LEAD_DATA:")) {
        const match = aiResponse.match(dataPattern);

        if (match && match[1]) {
            try {
                const leadData = JSON.parse(match[1]);
                console.log("✅ Dữ liệu khách hàng bóc được:", leadData);

                // Gửi dữ liệu nếu có ít nhất 1 thông tin
                if (leadData.name || leadData.phone || leadData.email) {
                    sendLeadToGoogleSheets(leadData, formattedHistory);
                }
            } catch (error) {
                console.error("❌ Lỗi parse JSON từ AI:", error);
            }
        }
        // Xóa tag ẩn khỏi câu trả lời
        aiResponse = aiResponse.replace(dataPattern, "").trim();
    }
    return aiResponse;
}

/**
 * Hàm gửi dữ liệu Lead lên Google Apps Script → Google Sheets
 */
async function sendLeadToGoogleSheets(leadData, chatHistoryText) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: leadData.name || '',
                phone: leadData.phone || '',
                email: leadData.email || '',
                source: window.location.href,
                sessionId: AI_CHAT_SESSION_ID,
                chatHistory: chatHistoryText,
                timestamp: new Date().toLocaleString('vi-VN')
            })
        });
        console.log("📤 Đã đồng bộ dữ liệu vào Google Sheets!");
    } catch (err) {
        console.warn("⚠️ Không gửi được dữ liệu lead:", err);
    }
}
