// ============================================
// 1. HIỆU ỨNG TRƯỢT & MENU (MƯỢT MÀ NHƯ IPHONE)
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

// Smooth Scroll trượt êm
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
// 2. "BỘ NÃO" AI - KẾT NỐI DEEPSEEK API
// ============================================

// 👇 DÁN API KEY DEEPSEEK CỦA BẠN VÀO ĐÂY (Dải sk-...) 👇
const DEEPSEEK_API_KEY = 'sk-069cb4fa81214690a5f173a13b723df6'; 

const SYSTEM_PROMPT = "Bạn là Mentor 12A1, trợ lý của Nhóm 1 lớp 12A1 THPT Lê Quý Đôn. Hãy xưng Mình, gọi Bạn/Cậu. Bạn là chuyên gia tư vấn hướng nghiệp và tâm lý học đường cực kỳ thân thiện.";

async function sendToDeepSeek(userText, msgBox) {
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = '<i>DeepSeek đang suy nghĩ... 🧠</i>';
    msgBox.appendChild(loadingDiv);
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('DÁN_API_KEY')) {
            throw new Error("Bạn chưa nhập API Key DeepSeek!");
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // Model chuẩn của DeepSeek
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userText }
                ],
                stream: false
            })
        });

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        if(loadingElement) loadingElement.remove();

        if (response.ok && data.choices && data.choices[0].message) {
            const botText = data.choices[0].message.content;
            const resDiv = document.createElement('div');
            resDiv.className = 'message bot-message';
            // Render Markdown cơ bản và xuống dòng
            resDiv.innerHTML = botText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            msgBox.appendChild(resDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        } else {
            throw new Error(data.error ? data.error.message : "DeepSeek từ chối phản hồi");
        }
    } catch (err) {
        const loadingElement = document.getElementById(loadingId);
        if(loadingElement) loadingElement.remove();
        
        const errDiv = document.createElement('div');
        errDiv.className = 'message bot-message';
        errDiv.style.color = '#f43f5e';
        errDiv.innerHTML = `⚠️ <b>Lỗi DeepSeek:</b> ${err.message}`;
        msgBox.appendChild(errDiv);
        console.error("DeepSeek Error:", err);
    }
}

// Xử lý sự kiện gửi tin (Chat nhúng & Chat nổi)
const chatConfigs = [
    { in: 'embed-chat-input', btn: 'embed-send-btn', box: 'embed-chat-messages' },
    { in: 'floating-chat-input', btn: 'floating-send-btn', box: 'floating-chat-messages' }
];

chatConfigs.forEach(conf => {
    const inputEl = document.getElementById(conf.in);
    const btnEl = document.getElementById(conf.btn);
    const boxEl = document.getElementById(conf.box);
    if (btnEl && inputEl && boxEl) {
        const action = () => {
            const val = inputEl.value.trim();
            if (val) {
                const userDiv = document.createElement('div');
                userDiv.className = 'message user-message';
                userDiv.textContent = val;
                boxEl.appendChild(userDiv);
                inputEl.value = '';
                sendToDeepSeek(val, boxEl);
            }
        };
        btnEl.onclick = action;
        inputEl.onkeypress = (e) => { if(e.key === 'Enter') action(); };
    }
});

// Sidebar & Float Toggle & Navbar Effects
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
