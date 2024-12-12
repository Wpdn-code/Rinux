const calendarList = {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let activeDate = '';

Number.prototype.pad = function () {
    return this < 10 ? '0' + this : this;
}

function renderCalendar() {
    const dateBoard = document.getElementById('day');
    dateBoard.innerHTML = '';

    const dateTitle = document.querySelector('.dateTitle');
    dateTitle.innerHTML = `${currentYear}년 ${(currentMonth + 1).pad()}월`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDate = new Date();

    for (let i = 0; i < firstDay; i++) {
        dateBoard.innerHTML += `<div></div>`;
    }

    for (let day = 1; day <= lastDate; day++) {
        const isToday =
            currentYear === currentDate.getFullYear() &&
            currentMonth === currentDate.getMonth() &&
            day === currentDate.getDate();

        const dayClass = isToday ? 'today' : '';
        const formattedDate = `${currentYear}-${(currentMonth + 1).pad()}-${day.pad()}`;
        const hasMemoClass = calendarList[formattedDate] && calendarList[formattedDate].length > 0 ? 'hasMemo' : '';

        const plans = calendarList[formattedDate]
            ? calendarList[formattedDate]
                  .map((plan, index) =>
                      `<p 
                          class="${plan.highlighted ? 'highlighted-plan' : ''} ${plan.done ? 'completed-plan' : ''}">
                          <input type="checkbox" ${plan.done ? 'checked' : ''} 
                              onclick="toggleComplete('${formattedDate}', ${index}, event)">
                          <span onclick="toggleHighlight('${formattedDate}', ${index}, event)">${plan.text}</span>
                      </p>`
                  ).join('')
            : '';

        dateBoard.innerHTML += `
            <div class="${dayClass} ${hasMemoClass}" onclick="openModal('${formattedDate}', event)">
                <strong>${day}</strong>
                ${plans}
            </div>`;
    }
}

function openModal(date, event) {
    event.stopPropagation(); // Prevent propagation to parent click
    activeDate = date;
    const modalTextarea = document.getElementById('modalTextarea');
    modalTextarea.value = calendarList[date]
        ? calendarList[date].map(plan => plan.text).join('\n')
        : '';
    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function savePlan() {
    const modalTextarea = document.getElementById('modalTextarea');
    const plans = modalTextarea.value.split('\n').filter(plan => plan.trim() !== '');
    calendarList[activeDate] = plans.map(plan => ({ text: plan, done: false, highlighted: false }));
    closeModal();
    renderCalendar();
}

// 이벤트 리스너
document.querySelector('.prevDay').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

document.querySelector('.nextDay').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// 페이지 로드 시 데이터 불러오기
window.onload = () => {
    loadCalendarData(); // 데이터 로드 함수는 필요에 따라 추가
    renderCalendar();
};
