// ============================================
// CHỨC NĂNG 1: HIỆU ỨNG TRƯỢT KHI CUỘN TRANG (SCROLL REVEAL)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15, 
        rootMargin: "0px 0px -50px 0px" 
    };

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
// CHỨC NĂNG 2: SMOOTH SCROLL (CUỘN CHUẨN XÁC)
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
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            
            document.getElementById('nav-menu').classList.remove('active');
        }
    });
});

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
if(mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });
}

// ============================================
// CHỨC NĂNG 3: "NÃO BỘ" AI (PHIÊN BẢN GỠ LỖI SIÊU CẤP)
// ============================================
// 👇 DÁN MÃ API KEY VÀO ĐÂY (KIỂM TRA KỸ KHÔNG DƯ KHOẢNG TRẮNG) 👇
const API_KEY = 'AIzaSyCzWiNYlc-XaoTcss7f394fw4sFlkcDOWA'; 

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

const systemContext = `Bạn tên là "Mentor 12A1", chuyên gia tư vấn cực kỳ thân thiện. Tạo bởi Nhóm 1 (Khánh Việt, Anh Thư, Hồng Oanh) lớp 12A1 THPT Lê Quý Đôn. Xưng "Mình", gọi người dùng là "Cậu" hoặc "Bạn". Trả lời ngắn gọn, có emoji. Dưới đây là câu hỏi: `;

async function sendToGemini(userText, messageContainer) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const loadingId = 'loading-' + Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('message', 'bot-message');
    loadingMsg.id = loadingId;
    loadingMsg.innerHTML = '<i>Đang rặn não suy nghĩ... 💭</i>';
    messageContainer.appendChild(loadingMsg);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    try {
        if (API_KEY === 'DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY' || API_KEY.trim() === '') {
            throw new Error("CHƯA_NHẬP_KEY");
        }

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
            console.error("Lỗi chi tiết từ Google:", data);
            appendMessage(`⚠️ Google báo lỗi: ${data.error.message}`, true, messageContainer);
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            appendMessage(data.candidates[0].content.parts[0].text, true, messageContainer);
        } else {
            appendMessage("Lỗi không lấy được dữ liệu ứng viên. Cậu hỏi lại nhé!", true, messageContainer);
        }
    } catch (error) {
        document.getElementById(loadingId).remove();
        console.error("Mã lỗi chi tiết:", error);
        
        if (error.message === "CHƯA_NHẬP_KEY") {
            appendMessage("🚨 LỖI: Cậu chưa dán API Key vào file main.js kìa!", true, messageContainer);
        } 
        else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            appendMessage("🚨 LỖI BỊ CHẶN (Failed to fetch): Trình duyệt đang chặn kết nối! <br><br><b>Cách sửa:</b><br>1. Tắt tiện ích chặn quảng cáo (Adblock/Ublock).<br>2. Nếu cậu đang click đúp mở file index.html (trên URL hiện chữ file:///), cậu phải dùng tính năng <b>Live Server</b> trong VS Code để mở web nhé!", true, messageContainer);
        } 
        else {
            appendMessage(`🚨 LỖI HỆ THỐNG: ${error.message}. Cậu hãy F12 lên, qua tab Console xem báo chữ đỏ gì rồi gửi cho mình fix nhé!`, true, messageContainer);
        }
    }
}

// Xử lý gửi tin cho Chat Nhúng
const embedInput = document.getElementById('embed-chat-input');
const embedSendBtn = document.getElementById('embed-send-btn');
const embedMessages = document.getElementById('embed-chat-messages');

function handleEmbedSend() {
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

window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (window.scrollY > 500) { backToTopBtn.classList.add('show'); } 
    else { backToTopBtn.classList.remove('show'); }
    
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); } 
    else { navbar.classList.remove('scrolled'); }
});

document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
