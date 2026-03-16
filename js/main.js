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
// CHỨC NĂNG 3: "NÃO BỘ" AI (PHIÊN BẢN ỔN ĐỊNH - GEMINI PRO)
// ============================================
// 👇 DÁN MÃ API KEY CỦA CẬU VÀO GIỮA 2 DẤU NHÁY ĐƠN BÊN DƯỚI 👇
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

const systemContext = `Bạn tên là "Mentor 12A1", chuyên gia tư vấn cực kỳ thân thiện. Tạo bởi Nhóm
