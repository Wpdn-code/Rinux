function toggleComplete(date, index, event) {
    event.stopPropagation(); // Prevent propagation to parent click
    calendarList[date][index].done = !calendarList[date][index].done; // 완료 상태를 토글
    saveCalendarData(); // 로컬 스토리지에 저장
    renderCalendar(); // 달력 다시 렌더링
}

function toggleHighlight(date, index, event) {
    event.stopPropagation(); // Prevent propagation to parent click
    calendarList[date][index].highlighted = !calendarList[date][index].highlighted; // 하이라이트 상태를 토글
    saveCalendarData(); // 로컬 스토리지에 저장
}
