// 계획 강조 및 완료 상태 토글 기능

function toggleComplete(date, index, event) {
    event.stopPropagation(); // Prevent propagation to parent click
    calendarList[date][index].done = !calendarList[date][index].done;
    saveCalendarData();
    renderCalendar();
}

function toggleHighlight(date, index, event) {
    event.stopPropagation(); // Prevent propagation to parent click
    calendarList[date][index].highlighted = !calendarList[date][index].highlighted;
    saveCalendarData();
    renderCalendar();
}
