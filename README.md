# KIEN AI Premium Landing Page & Active Chatbot

Dự án Landing Page cao cấp dành cho Tư vấn Chiến lược AI, tích hợp chatbot có khả năng hoạt động thực tế thông qua API Key.

## Tính năng chính
- **Giao diện Premium**: Thiết kế Dark Mode tối giản, sử dụng bộ màu Deep Blue & Cyan, hiệu ứng Glassmorphism và Mesh Gradient.
- **Chatbot AI Đa nền tảng**: Hỗ trợ cả OpenAI (GPT-4o) và Google Gemini (2.0 Flash/Pro).
- **Cấu hình Bảo mật**: API Key được lưu trữ trực tiếp trong `localStorage` của trình duyệt, không gửi qua bất kỳ máy chủ trung gian nào.
- **Tương tác**: Hoạt ảnh vi mô (micro-animations), hiệu ứng di chuột (hover) và giao diện chat nổi hiện đại.

## Cách sử dụng
1. Mở tệp `index.html` bằng trình duyệt (Chrome, Safari, Edge).
2. Nhấn vào nút **"API Config"** ở thanh điều hướng trên cùng.
3. Nhập API Key của bạn (OpenAI hoặc Gemini) và nhấn **"Kích hoạt Engine"**.
4. Mở cửa sổ chat ở góc dưới bên phải và bắt đầu tương tác với Trợ lý AI của KIEN.

## Cấu trúc dự án
- `index.html`: Giao diện chính và CSS (Tailwind).
- `chatbot.js`: Logic xử lý hội thoại và kết nối API.

---
*Phát triển bởi KIEN AI Framework v2.0*
