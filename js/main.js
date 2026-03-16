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
            
            // Đóng menu mobile nếu đang mở
            document.getElementById('nav-menu').classList.remove('active');
        }
    });
});

// Toggle Mobile Menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
if(mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });
}

// Nút Back to top
window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
    
    // Đổi màu Navbar khi cuộn
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// CHỨC NĂNG 3: "NÃO BỘ" AI (DÙNG CHUNG CHO 2 KHUNG CHAT)
// ============================================
const API_KEY = 'AIzaSyCzWiNYlc-XaoTcss7f394fw4sFlkcDOWA'; // <-- Thay API Key Gemini vào đây

// Logic Ẩn/Hiện Khung Chat Nổi
const aiAssistantBtn = document.getElementById('ai-assistant-btn');
const chatboxContainer = document.getElementById('chatbox-container');
const closeChatBtn = document.getElementById('close-chat-btn');

if (aiAssistantBtn && chatboxContainer && closeChatBtn) {
    aiAssistantBtn.addEventListener('click', () => chatboxContainer.classList.add('active'));
    closeChatBtn.addEventListener('click', () => chatboxContainer.classList.remove('active'));
}

// Hàm thêm tin nhắn chung
function appendMessage(text, isBot, container) {
    if(!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(isBot ? 'bot-message' : 'user-message');
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// Cài đặt ngữ cảnh AI
const systemContext = `
Bạn tên là "Mentor 12A1", một chuyên gia tư vấn học tập, hướng nghiệp thân thiện. 
Được lập trình bởi Nhóm 1 (Khánh Việt - Trưởng nhóm, Anh Thư, Hồng Oanh) lớp 12A1 THPT Lê Quý Đôn.
Xưng "Mình", gọi người dùng là "Cậu" hoặc "Bạn". Dùng emoji thân thiện.
Câu hỏi của người dùng là: 
`;

// Hàm Gửi và Nhận API
async function sendToGemini(userText, messageContainer) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    // Thêm tin nhắn Loading
    const loadingId = 'loading-' + Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('message', 'bot-message');
    loadingMsg.id = loadingId;
    loadingMsg.innerHTML = '<i>Đang suy nghĩ... 💭</i>';
    messageContainer.appendChild(loadingMsg);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemContext + userText }] }]
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove(); // Xóa loading
        
        if (data.candidates && data.candidates.length > 0) {
            appendMessage(data.candidates[0].content.parts[0].text, true, messageContainer);
        } else {
            appendMessage("Lỗi kết nối. Cậu hỏi lại nhé 😢", true, messageContainer);
        }
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage("Hệ thống quá tải, thử lại sau nha!", true, messageContainer);
    }
}

// Xử lý gửi tin cho Chat Nhúng (Embedded)
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

// Xử lý gửi tin cho Chat Nổi (Floating)
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
