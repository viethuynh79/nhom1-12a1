// ============================================
// CHỨC NĂNG 1: HIỆU ỨNG TRƯỢT KHI CUỘN TRANG (SCROLL REVEAL)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));
});

// ============================================
// CHỨC NĂNG 2: SMOOTH SCROLL & MENU MOBILE
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            window.scrollTo({ top: elementPosition + window.pageYOffset - headerHeight - 20, behavior: "smooth" });
            const navMenu = document.getElementById('nav-menu');
            if(navMenu) navMenu.classList.remove('active');
        }
    });
});

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => document.getElementById('nav-menu').classList.toggle('active'));

// ============================================
// CHỨC NĂNG 3: "NÃO BỘ" AI (PHIÊN BẢN TỰ ĐỘNG DÒ TÌM MODEL CHUẨN)
// ============================================

// 👇 DÁN MÃ API KEY CỦA BẠN VÀO GIỮA 2 DẤU NHÁY ĐƠN 👇
const API_KEY = 'AIzaSyCn7g59LvwsHL0lcO2me_ZsTWV52aoVpGE'; 

let activeGeminiModel = null; // Biến lưu trữ Model khả dụng nhất

const aiAssistantBtn = document.getElementById('ai-assistant-btn');
const chatboxContainer = document.getElementById('chatbox-container');
const closeChatBtn = document.getElementById('close-chat-btn');

if (aiAssistantBtn && chatboxContainer && closeChatBtn) {
    aiAssistantBtn.addEventListener('click', () => chatboxContainer.classList.add('active'));
    closeChatBtn.addEventListener('click', () => chatboxContainer.classList.remove('active'));
}

function appendMessage(text, isBot, container) {
    if(!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(isBot ? 'bot-message' : 'user-message');
    
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    msgDiv.innerHTML = formattedText;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

const systemContext = `Bạn tên là "Mentor 12A1", chuyên gia tư vấn học tập. Tạo bởi Nhóm 1 (Khánh Việt, Anh Thư, Hồng Oanh) lớp 12A1 THPT Lê Quý Đôn. Xưng "Mình", gọi người dùng là "Cậu" hoặc "Bạn". Trả lời ngắn gọn, có emoji. Dưới đây là câu hỏi: `;

// THUẬT TOÁN TỰ ĐỘNG TÌM MODEL PHÙ HỢP VỚI API KEY
async function initGeminiModel(messageContainer) {
    if (activeGeminiModel) return activeGeminiModel;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error.message);

        // Lọc ra các Model hỗ trợ Chat (generateContent)
        const validModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
        
        if (validModels.length === 0) throw new Error("API Key này không có model nào hỗ trợ chat.");

        // Ưu tiên chọn các Model mới nhất, nếu không có thì lấy cái đầu tiên khả dụng
        let chosen = validModels.find(m => m.name.includes('gemini-1.5-flash'));
        if (!chosen) chosen = validModels.find(m => m.name.includes('gemini-1.5-pro'));
        if (!chosen) chosen = validModels.find(m => m.name.includes('gemini-pro'));
        if (!chosen) chosen = validModels[0]; 

        activeGeminiModel = chosen.name; // Sẽ ra chuỗi dạng "models/gemini-xxx"
        return activeGeminiModel;
    } catch (error) {
        throw new Error("Lỗi dò Model: " + error.message);
    }
}

async function sendToGemini(userText, messageContainer) {
    const loadingId = 'loading-' + Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('message', 'bot-message');
    loadingMsg.id = loadingId;
    loadingMsg.innerHTML = '<i>Đang kết nối hệ thống... 💭</i>';
    messageContainer.appendChild(loadingMsg);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    try {
        if (API_KEY === 'DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY' || API_KEY.trim() === '') {
            throw new Error("CHƯA_NHẬP_KEY");
        }

        // Tự động tìm tên Model chuẩn trước khi gửi
        const modelName = await initGeminiModel(messageContainer);
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemContext + userText }] }]
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove(); 
        
        if (!response.ok) {
            appendMessage(`⚠️ Lỗi từ Google: ${data.error ? data.error.message : 'Lỗi không xác định'}`, true, messageContainer);
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            appendMessage(data.candidates[0].content.parts[0].text, true, messageContainer);
        } else {
            appendMessage("Xin lỗi, mình không phân tích được dữ liệu này. Cậu thử lại nhé!", true, messageContainer);
        }
    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.remove();
        
        if (error.message === "CHƯA_NHẬP_KEY") {
            appendMessage("🚨 LỖI: Cậu chưa dán API Key vào file main.js!", true, messageContainer);
        } else if (error.message.includes('Failed to fetch')) {
            appendMessage("🚨 LỖI MẠNG: Không thể kết nối. Hãy tắt phần mềm chặn quảng cáo đi nhé!", true, messageContainer);
        } else {
            appendMessage(`🚨 ${error.message}`, true, messageContainer);
        }
    }
}

// Xử lý gửi tin cho Chat Nhúng
const embedInput = document.getElementById('embed-chat-input');
const embedSendBtn = document.getElementById('embed-send-btn');
const embedMessages = document.getElementById('embed-chat-messages');

function handleEmbedSend() {
    if (!embedInput) return;
    const text = embedInput.value.trim();
    if (!text) return;
    appendMessage(text, false, embedMessages);
    embedInput.value = '';
    sendToGemini(text, embedMessages);
}

if(embedSendBtn && embedInput) {
    embedSendBtn.addEventListener('click', handleEmbedSend);
    embedInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleEmbedSend(); });
}

// Xử lý gửi tin cho Chat Nổi
const floatingInput = document.getElementById('floating-chat-input');
const floatingSendBtn = document.getElementById('floating-send-btn');
const floatingMessages = document.getElementById('floating-chat-messages');

function handleFloatingSend() {
    if (!floatingInput) return;
    const text = floatingInput.value.trim();
    if (!text) return;
    appendMessage(text, false, floatingMessages);
    floatingInput.value = '';
    sendToGemini(text, floatingMessages);
}

if(floatingSendBtn && floatingInput) {
    floatingSendBtn.addEventListener('click', handleFloatingSend);
    floatingInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleFloatingSend(); });
}

// BACK TO TOP
window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        if (window.scrollY > 500) backToTopBtn.classList.add('show');
        else backToTopBtn.classList.remove('show');
    }
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
});

const backToTopBtn = document.getElementById('back-to-top');
if(backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
