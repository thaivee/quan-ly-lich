// --- 1. KHAI BÁO & KHỞI TẠO ---
let events = JSON.parse(localStorage.getItem('eduEvents')) || [];

// Cấu hình Icon theo màu sắc (3 loại chính)
const iconMap = {
    'blue': 'fa-book-open',
    'pink': 'fa-file-pen',
    'orange': 'fa-fire',
    'green': 'fa-star',
    'purple': 'fa-bell'
};

// Dữ liệu danh mục mặc định (3 loại)
const defaultCategories = [
    { id: 'cat_1', name: 'Lịch học', color: 'blue' },
    { id: 'cat_2', name: 'Lịch thi', color: 'pink' },
    { id: 'cat_3', name: 'Deadline', color: 'orange' }
];

let categories = JSON.parse(localStorage.getItem('eduCategories'));
if (!categories || categories.length === 0) {
    categories = defaultCategories;
}

let currentViewDate = new Date();
let currentViewType = 'week';
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    initYearSelect();       
    renderCategoryOptions(); 
    renderSidebarSubmenu();
    renderCalendar();
    updateStats(); 
    setGreeting(); // <--- Hàm này thêm icon cloud vào tiêu đề
});

// --- 2. HÀM LƯU DỮ LIỆU ---
function saveEvents() {
    localStorage.setItem('eduEvents', JSON.stringify(events));
    updateStats();
}

function saveCategories() {
    localStorage.setItem('eduCategories', JSON.stringify(categories));
    renderCategoryOptions(); 
    renderSidebarSubmenu();
}

// --- 3. LOGIC SIDEBAR DROPDOWN ---
window.toggleSidebarSubmenu = function(element) {
    const submenu = document.getElementById('sidebarSubMenu');
    if(submenu) {
        submenu.classList.toggle('open');
        element.classList.toggle('expanded');
    }
}

function renderSidebarSubmenu() {
    const submenu = document.getElementById('sidebarSubMenu');
    if(!submenu) return;
    submenu.innerHTML = '';

    categories.forEach(cat => {
        const link = document.createElement('a');
        link.className = 'submenu-item';
        link.href = `category_detail.html?type=${cat.color}&name=${encodeURIComponent(cat.name)}`;
        const iconClass = iconMap[cat.color] || 'fa-circle';
        link.innerHTML = `<i class="fas ${iconClass}" style="width: 20px; text-align: center; color: var(--tag-${cat.color}-text)"></i> ${cat.name}`;
        submenu.appendChild(link);
    });
}

// --- 4. RENDER CALENDAR ---
function checkDateValidity(dateString) {
    if (!dateString) return "Vui lòng chọn ngày!";
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (year < 1900 || year > 2100) return "Năm không hợp lệ!";
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return `Tháng ${month} năm ${year} chỉ có ${daysInMonth} ngày!`;
    return null;
}

function renderWeek() {
    const grid = document.getElementById('weekGridContent');
    const label = document.getElementById('calendarLabel');
    if (!grid || !label) return;
    grid.innerHTML = '';
    const currentDay = currentViewDate.getDay();
    const distToMon = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(currentViewDate);
    monday.setDate(currentViewDate.getDate() - distToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    label.innerText = `Tuần: ${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const isToday = new Date().toDateString() === d.toDateString();
        const dayEvents = events.filter(e => e.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));
        let htmlEvents = '';
        dayEvents.forEach(ev => {
            htmlEvents += `<div class="event-item type-${ev.type}" onclick="openEditModal(${ev.id}); event.stopPropagation()"><b>${ev.time}</b> ${ev.title}</div>`;
        });
        const col = document.createElement('div');
        col.className = `day-column ${isToday ? 'today' : ''}`;
        col.onclick = () => openAddModal(dateKey);
        col.innerHTML = `<span class="day-label">${day}/${month}</span>${htmlEvents}`;
        grid.appendChild(col);
    }
}

function renderMonth() {
    const grid = document.getElementById('monthGridContent');
    const label = document.getElementById('calendarLabel');
    if (!grid || !label) return;
    grid.innerHTML = '';
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    label.innerText = `Tháng ${month + 1}, ${year}`;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < offset; i++) {
        const cell = document.createElement('div');
        cell.className = 'm-cell empty-cell'; 
        grid.appendChild(cell);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateKey);
        const cell = document.createElement('div');
        cell.className = 'm-cell';
        cell.onclick = () => openAddModal(dateKey);
        let htmlEvents = '';
        if (dayEvents.length > 0) {
            dayEvents.forEach(ev => {
                htmlEvents += `<div class="month-event type-${ev.type}" onclick="openEditModal(${ev.id}); event.stopPropagation()">${ev.title}</div>`;
            });
        }
        cell.innerHTML = `<div class="date-number">${d}</div>${htmlEvents}`;
        grid.appendChild(cell);
    }
}

// --- 5. CATEGORY MANAGEMENT (LƯU VÀ RENDER DROPDOWN) ---
function renderCategoryOptions() {
    const typeSelects = [document.getElementById('evtType'), document.getElementById('editType')];
    typeSelects.forEach(select => {
        if(!select) return;
        select.innerHTML = ''; 
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.color; 
            option.innerText = cat.name;
            select.appendChild(option);
        });
    });
}



// --- 6. UPDATE STATS (LOGIC CHUẨN) ---
function updateStats() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    let todayCount = 0;
    let upcomingCount = 0;

    events.forEach(ev => {
        const evDate = new Date(ev.date);
        evDate.setHours(0, 0, 0, 0);

        if (evDate.getTime() === now.getTime()) {
            todayCount++;
        }

        if (evDate >= now && evDate <= nextWeek) {
            upcomingCount++;
        }
    });

    if(document.getElementById('statToday')) 
        document.getElementById('statToday').innerText = todayCount;
    
    if(document.getElementById('statUpcoming')) 
        document.getElementById('statUpcoming').innerText = upcomingCount;
    
    if(document.getElementById('statTotal')) 
        document.getElementById('statTotal').innerText = events.length;
}

// --- 7. UTILS & ACTIONS ---
function initYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    if(!yearSelect) return;
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i; option.text = i;
        yearSelect.appendChild(option);
    }
    yearSelect.addEventListener('change', function() {
        currentViewDate.setFullYear(parseInt(this.value));
        renderCalendar();
    });
}

function setGreeting() {
    const h = new Date().getHours();
    let msg = h < 12 ? "Chào buổi sáng" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
    
    document.getElementById('greetingMsg').innerHTML = `${msg}, tze!`;
    document.getElementById('currentDateDisplay').innerText = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}
window.openAddModal = function(dateStr) {
    if (dateStr) document.getElementById('evtDate').value = dateStr;
    else document.getElementById('evtDate').value = '';
    document.getElementById('addModal').classList.remove('hidden');
}
window.openEditModal = function(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    editingId = id;
    document.getElementById('editTitle').value = ev.title;
    document.getElementById('editDate').value = ev.date;
    document.getElementById('editTime').value = ev.time;
    const typeSelect = document.getElementById('editType');
    if(typeSelect) typeSelect.value = ev.type;
    document.getElementById('editModal').classList.remove('hidden');
}
document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('evtTitle').value.trim();
    const dateInput = document.getElementById('evtDate').value;
    const time = document.getElementById('evtTime').value;
    const type = document.getElementById('evtType').value;
    if (!title) return alert("⚠️ Vui lòng nhập tên!");
    events.push({ id: Date.now(), title, date: dateInput, time, type });
    saveEvents(); renderCalendar();
    document.getElementById('addModal').classList.add('hidden');
    e.target.reset();
});
document.getElementById('editEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('editTitle').value.trim();
    const dateInput = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    const type = document.getElementById('editType').value;
    const index = events.findIndex(e => e.id === editingId);
    if (index !== -1) {
        events[index] = { id: editingId, title, date: dateInput, time, type };
        saveEvents(); renderCalendar();
        document.getElementById('editModal').classList.add('hidden');
    }
});
window.deleteEvent = function() {
    if (confirm("Bạn có chắc muốn xóa không?")) {
        events = events.filter(e => e.id !== editingId);
        saveEvents(); renderCalendar();
        document.getElementById('editModal').classList.add('hidden');
    }
}
window.switchCalendarView = function(type) {
    currentViewType = type;
    const btns = document.querySelectorAll('.view-btn');
    if (type === 'week') { btns[0].classList.add('active'); btns[1].classList.remove('active'); }
    else { btns[0].classList.remove('active'); btns[1].classList.add('active'); }
    document.getElementById('weekView').classList.toggle('hidden', type !== 'week');
    document.getElementById('monthView').classList.toggle('hidden', type !== 'month');
    renderCalendar();
}
window.changeDate = function(delta) {
    if (currentViewType === 'week') currentViewDate.setDate(currentViewDate.getDate() + (delta * 7));
    else currentViewDate.setMonth(currentViewDate.getMonth() + delta);
    renderCalendar();
}
window.goToToday = function() { currentViewDate = new Date(); renderCalendar(); }
document.getElementById('openAddModalBtn').addEventListener('click', () => window.openAddModal());
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');
function renderCalendar() {
    if (currentViewType === 'week') renderWeek(); else renderMonth();
    const yearSelect = document.getElementById('yearSelect');
    if(yearSelect) yearSelect.value = currentViewDate.getFullYear();
}