// ============================================
// 1. HIỆU ỨNG TRƯỢT & MENU (GIỮ NGUYÊN)
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
// 2. "BỘ NÃO" AI - PHIÊN BẢN FREE TIER CHUẨN
// ============================================

// 👇 DÁN API KEY CỦA BẠN VÀO ĐÂY (KHÔNG DƯ KHOẢNG TRẮNG) 👇
const API_KEY = 'AIzaSyDgzrbvi9WE0-UkVDRMlTgH9HT3tbzjHzs'; 

const PROMPT = "Bạn là Mentor 12A1, trợ lý của Nhóm 1 lớp 12A1 THPT Lê Quý Đôn. Xưng Mình, gọi Bạn/Cậu. Tư vấn hướng nghiệp thân thiện.";

async function sendToAI(userText, msgBox) {
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = '<i>Đang kết nối AI (Free Tier)... 💭</i>';
    msgBox.appendChild(loadingDiv);
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        if (!API_KEY || API_KEY.includes('DÁN_API_KEY')) {
            throw new Error("Cậu chưa dán API Key vào file main.js!");
        }

        // ĐƯỜNG DẪN CHUẨN CHO BẢN FREE: Gemini 1.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: PROMPT + "\nCâu hỏi của bạn: " + userText }]
                }]
            })
        });

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        if(loadingElement) loadingElement.remove();

        if (response.ok && data.candidates && data.candidates[0].content) {
            const botText = data.candidates[0].content.parts[0].text;
            const resDiv = document.createElement('div');
            resDiv.className = 'message bot-message';
            // Render Markdown cơ bản
            resDiv.innerHTML = botText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            msgBox.appendChild(resDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        } else {
            // Nếu model Flash bị lỗi, báo lỗi cụ thể
            throw new Error(data.error ? data.error.message : "Google từ chối phản hồi");
        }
    } catch (err) {
        const loadingElement = document.getElementById(loadingId);
        if(loadingElement) loadingElement.remove();
        
        const errDiv = document.createElement('div');
        errDiv.className = 'message bot-message';
        errDiv.style.border = '1px solid #f43f5e';
        errDiv.innerHTML = `⚠️ <b>Lỗi Bot:</b> ${err.message}<br><small>Thử lại sau vài giây nhé!</small>`;
        msgBox.appendChild(errDiv);
    }
}

// Xử lý sự kiện gửi tin (Cho cả chat nhúng và chat nổi)
const setups = [
    { in: 'embed-chat-input', btn: 'embed-send-btn', box: 'embed-chat-messages' },
    { in: 'floating-chat-input', btn: 'floating-send-btn', box: 'floating-chat-messages' }
];

setups.forEach(s => {
    const input = document.getElementById(s.in);
    const btn = document.getElementById(s.btn);
    const box = document.getElementById(s.box);
    if (btn && input && box) {
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
const mobileBtn = document.getElementById('mobile-menu-btn');

if(aiBtn) aiBtn.onclick = () => chatContainer.classList.add('active');
if(closeBtn) closeBtn.onclick = () => chatContainer.classList.remove('active');
if(mobileBtn) mobileBtn.onclick = () => document.getElementById('nav-menu').classList.toggle('active');

window.onscroll = () => {
    const nav = document.getElementById('navbar');
    const btt = document.getElementById('back-to-top');
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    if(btt) btt.classList.toggle('show', window.scrollY > 500);
};

if(document.getElementById('back-to-top')) {
    document.getElementById('back-to-top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}
