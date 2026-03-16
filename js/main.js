// ============================================
// 1. HIỆU ỨNG TRƯỢT & CHẾ ĐỘ DARK MODE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal (Hiệu ứng hiện dần)
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

    // Khởi tạo Dark Mode
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Kiểm tra bộ nhớ xem người dùng đã chọn dark mode trước đó chưa
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeIcon) themeIcon.className = 'fas fa-sun';
    }

    // Xử lý nút bấm Dark Mode
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.className = 'fas fa-moon';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.className = 'fas fa-sun';
            }
        });
    }
});

// Đóng Menu Mobile khi nhấn vào một Link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.getElementById('nav-menu');
        if(navMenu) navMenu.classList.remove('active');
    });
});

// ============================================
// 2. "BỘ NÃO" AI - KẾT NỐI DEEPSEEK API
// ============================================
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
                model: "deepseek-chat",
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

// Xử lý sự kiện gửi tin cho phần Chat ở Trang chủ
const inputEl = document.getElementById('embed-chat-input');
const btnEl = document.getElementById('embed-send-btn');
const boxEl = document.getElementById('embed-chat-messages');

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

// ============================================
// 3. XỬ LÝ GIAO DIỆN NAVBAR
// ============================================

const mobileBtn = document.getElementById('mobile-menu-btn');

// Bật tắt menu trên điện thoại
if(mobileBtn) mobileBtn.onclick = () => document.getElementById('nav-menu').classList.toggle('active');

// Thay đổi background thanh Navbar khi cuộn chuột
window.onscroll = () => {
    const nav = document.getElementById('navbar');
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
};
