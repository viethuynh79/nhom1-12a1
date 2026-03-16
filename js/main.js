// ============================================
// 1. HIỆU ỨNG TRƯỢT & MENU (KHÔNG THAY ĐỔI)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            window.scrollTo({ top: target.offsetTop - headerHeight - 10, behavior: "smooth" });
            const navMenu = document.getElementById('nav-menu');
            if(navMenu) navMenu.classList.remove('active');
        }
    });
});

// ============================================
// 2. "BỘ NÃO" AI - PHIÊN BẢN TỰ ĐỘNG FIX LỖI GOOGLE
// ============================================

// 👇 DÁN API KEY CỦA CẬU VÀO ĐÂY 👇
const API_KEY = 'AIzaSyDgzrbvi9WE0-UkVDRMlTgH9HT3tbzjHzs'; 

const PROMPT = "Bạn là Mentor 12A1, trợ lý của Nhóm 1 lớp 12A1 THPT Lê Quý Đôn. Xưng Mình, gọi Bạn/Cậu. Tư vấn hướng nghiệp thân thiện.";

async function sendToAI(userText, msgBox) {
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = '<i>Đang kết nối AI... 💭</i>';
    msgBox.appendChild(loadingDiv);
    msgBox.scrollTop = msgBox.scrollHeight;

    // Danh sách các URL có khả năng chạy được (Google thường đổi giữa các bản này)
    const apiEndpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`
    ];

    let success = false;
    let lastError = "";

    for (let url of apiEndpoints) {
        if (success) break;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT + userText }] }] })
            });

            const data = await response.json();
            
            if (response.ok && data.candidates) {
                const botText = data.candidates[0].content.parts[0].text;
                document.getElementById(loadingId).remove();
                
                const resDiv = document.createElement('div');
                resDiv.className = 'message bot-message';
                resDiv.innerHTML = botText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
                msgBox.appendChild(resDiv);
                msgBox.scrollTop = msgBox.scrollHeight;
                
                success = true;
            } else {
                lastError = data.error ? data.error.message : "Lỗi không xác định";
            }
        } catch (err) {
            lastError = err.message;
        }
    }

    if (!success) {
        document.getElementById(loadingId).remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'message bot-message';
        errDiv.style.color = 'red';
        errDiv.innerHTML = `⚠️ Google vẫn từ chối: ${lastError}. <br> Hãy kiểm tra xem bạn đã bật gói 'Free' trong AI Studio chưa nhé.`;
        msgBox.appendChild(errDiv);
    }
}

// Xử lý gửi tin
const setups = [
    { in: 'embed-chat-input', btn: 'embed-send-btn', box: 'embed-chat-messages' },
    { in: 'floating-chat-input', btn: 'floating-send-btn', box: 'floating-chat-messages' }
];

setups.forEach(s => {
    const input = document.getElementById(s.in);
    const btn = document.getElementById(s.btn);
    const box = document.getElementById(s.box);
    if (btn && input) {
        const action = () => {
            const val = input.value.trim();
            if (val) {
                const userDiv = document.createElement('div');
                userDiv.className = 'message user-message';
                userDiv.textContent = val;
                box.appendChild(userDiv);
                input.value = '';
                sendToAI(val, box);
            }
        };
        btn.onclick = action;
        input.onkeypress = (e) => { if(e.key === 'Enter') action(); };
    }
});

// Sidebar & Float Toggle
const aiBtn = document.getElementById('ai-assistant-btn');
const chatContainer = document.getElementById('chatbox-container');
const closeBtn = document.getElementById('close-chat-btn');
if(aiBtn) aiBtn.onclick = () => chatContainer.classList.add('active');
if(closeBtn) closeBtn.onclick = () => chatContainer.classList.remove('active');

window.onscroll = () => {
    const nav = document.getElementById('navbar');
    const btt = document.getElementById('back-to-top');
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    if(btt) btt.classList.toggle('show', window.scrollY > 500);
};
if(document.getElementById('back-to-top')) {
    document.getElementById('back-to-top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}
