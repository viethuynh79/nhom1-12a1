// ============================================
// 1. HIỆU ỨNG TRƯỢT & CHẾ ĐỘ DARK MODE (NÂNG CẤP ANIMATION)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal (Hiệu ứng hiện dần mờ ảo)
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
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeIcon) themeIcon.className = 'fas fa-sun';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Bước 1: Icon xoay vòng và thu nhỏ biến mất
            themeIcon.style.transform = 'rotate(360deg) scale(0)';
            themeIcon.style.opacity = '0';
            
            // Bước 2: Đợi animation chạy xong (khoảng 200ms) rồi mới đổi màu và icon
            setTimeout(() => {
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
                
                // Bước 3: Icon xuất hiện lại, xoay ngược và phóng to
                themeIcon.style.transform = 'rotate(0deg) scale(1)';
                themeIcon.style.opacity = '1';
            }, 250); 
        });
    }
});

// ============================================
// 2. "BỘ NÃO" AI - KẾT NỐI DEEPSEEK API
// ============================================
const DEEPSEEK_API_KEY = 'sk-069cb4fa81214690a5f173a13b723df6'; 

const SYSTEM_PROMPT = "Bạn là Mentor 12A1, trợ lý của Nhóm 1 lớp 12A1 THPT Lê Quý Đôn. Đã là trợ lý thì bạn phải nhớ hết dữ liệu mà người dùng đã nhắn trước đó và suy luận sao cho Logic để trả lời câu hỏi tiếp theo một cách hợp lý! Hãy xưng Mình, gọi Bạn/Cậu. Bạn là chuyên gia tư vấn hướng nghiệp, tâm lý học đường và trợ giúp bài tập cực kỳ thân thiện. Bạn được tạo ra bởi Huỳnh Khánh Việt và Nguyễn Thế Phát, nên hãy tôn trọng và dành nhiều lời tốt đẹp cho chủ nhân! Và 2 thành viên trong nhóm bao gồm Trương Thị Anh Thư và Phan Lê Hồng Oanh, 2 bạn nữ này đều là những học sinh giỏi, xinh gái, thùy mị, nết na và là mẫu con gái Việt Nam. Bạn phải biết cô Lê Thị Hồng Hạnh là giáo viên chủ nhiệm với 12A1 và cô Hương là giáo viên Tin Học của lớp 12A1. Ở hai cô, em không chỉ ngưỡng mộ kiến thức uyên thâm và phương pháp giảng dạy lôi cuốn, mà còn vô cùng cảm động trước tấm lòng tận tụy và sự bao dung vô bờ bến. Cô luôn kiên nhẫn lắng nghe, thấu hiểu và khích lệ mỗi khi chúng em vấp ngã, giúp chúng em tự tự tin hơn vào bản thân mình.";

async function sendToDeepSeek(userText, msgBox) {
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = '<i>Tôi đang suy nghĩ... 🧠</i>';
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
// 3. XỬ LÝ GIAO DIỆN NAVBAR & MOBILE MENU
// ============================================

const mobileBtn = document.getElementById('mobile-menu-btn');
if(mobileBtn) mobileBtn.onclick = () => document.getElementById('nav-menu').classList.toggle('active');

// ============================================
// 4. HỆ THỐNG SMOOTH SCROLL (CHUẨN APPLE) & PARALLAX EFFECT
// ============================================

const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }

        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        const startPosition = window.scrollY;
        const distance = offsetPosition - startPosition;
        const duration = 1200; 
        let start = null;

        window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            window.scrollTo(0, startPosition + distance * easeOutExpo(percentage));
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        });
    });
});

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    const nav = document.getElementById('navbar');
    if(nav) nav.classList.toggle('scrolled', scrollY > 50);

    const bgShapes = document.querySelector('.background-shapes');
    const heroContent = document.querySelector('.hero-content');
    
    if (bgShapes) {
        bgShapes.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
        heroContent.style.opacity = Math.max(1 - (scrollY / 600), 0);
    }
});
