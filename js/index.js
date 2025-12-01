document.addEventListener('DOMContentLoaded', () => {
    // Kích hoạt hiệu ứng cho Header và Content
    const header = document.querySelector('.header');
    const heroContent = document.querySelector('.hero-content');
    const footer = document.querySelector('.footer');
    const cards = document.querySelectorAll('.card');

    if (header) header.classList.add('loaded');
    if (heroContent) heroContent.classList.add('loaded');
    if (footer) footer.style.opacity = 1;

    // Hiển thị các card sau một chút thời gian
    setTimeout(() => {
        cards.forEach(card => {
            card.style.opacity = 1;
            card.style.transition = 'opacity 0.5s ease-out';
        });
    }, 500);


    // [TÍNH NĂNG CHUYỂN HƯỚNG NẾU CÓ DỮ LIỆU CŨ]
    /*
    const events = localStorage.getItem('eduEvents');
    if (events && JSON.parse(events).length > 0) {
        window.location.href = 'dashboard.html';
    }
    */
});