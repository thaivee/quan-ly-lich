document.addEventListener('DOMContentLoaded', () => {
    // 1. Cấu hình CHỈ 3 LOẠI icon (FontAwesome)
    const categoryConfig = {
        'blue':   { icon: 'fa-book-open', label: 'Lịch học' },
        'pink':   { icon: 'fa-file-pen',  label: 'Lịch thi' },
        'orange': { icon: 'fa-fire',      label: 'Deadline' }
    };

    // 2. Lấy tham số từ URL (ví dụ: ?type=blue)
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type'); 
    
    // Lấy tên từ URL hoặc map từ config (ưu tiên config để chuẩn)
    let name = params.get('name');
    if (categoryConfig[type]) {
        name = categoryConfig[type].label;
    }

    // Nếu type không hợp lệ hoặc không nằm trong 3 loại trên -> Về trang chủ
    if (!type || !categoryConfig[type]) {
        alert("Loại lịch không hợp lệ!");
        window.location.href = 'dashboard.html';
        return;
    }

    // 3. Cập nhật Header
    const config = categoryConfig[type];
    
    // Tên trang
    document.getElementById('pageTitle').innerText = name;
    
    // Icon to ở tiêu đề
    const iconContainer = document.getElementById('catIconContainer');
    iconContainer.innerHTML = `<i class="fas ${config.icon}" style="color: var(--tag-${type}-text); font-size: 32px;"></i>`;

    // Icon nhỏ ở card thống kê (Lấy màu chữ làm màu nền cho đẹp)
    const statIcon = document.getElementById('headerStatIcon');
    statIcon.style.backgroundColor = `var(--tag-${type}-text)`;
    statIcon.innerHTML = `<i class="fas fa-list" style="color: white;"></i>`;

    // 4. Lấy dữ liệu từ LocalStorage
    const events = JSON.parse(localStorage.getItem('eduEvents')) || [];

    // 5. Lọc và Sắp xếp
    const filteredEvents = events.filter(e => e.type === type);
    
    // Sắp xếp: Ngày gần nhất lên đầu
    filteredEvents.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    // 6. Hiển thị số lượng
    document.getElementById('eventCount').innerText = filteredEvents.length;

    // 7. Render danh sách
    const container = document.getElementById('timelineContainer');
    const emptyState = document.getElementById('emptyState');

    if (filteredEvents.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        container.innerHTML = ''; // Xóa nội dung cũ

        filteredEvents.forEach(ev => {
            const dateObj = new Date(ev.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();

            const row = document.createElement('div');
            row.className = 'timeline-row';
            
            row.innerHTML = `
                <div class="timeline-date">
                    <div class="date-big" style="color: var(--tag-${type}-text)">${day}</div>
                    <div class="date-small">Thg ${month}</div>
                    <div class="year-small">${year}</div>
                </div>
                <div class="timeline-content type-${ev.type}" style="border-left: 5px solid var(--tag-${type}-text);">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <h3 class="timeline-title">${ev.title}</h3>
                        <i class="fas ${config.icon}" style="font-size: 24px; color: var(--tag-${type}-text); opacity: 0.15;"></i>
                    </div>
                    <div class="timeline-time">
                        <i class="far fa-clock"></i> ${ev.time}
                    </div>
                </div>
            `;
            container.appendChild(row);
        });
    }
});