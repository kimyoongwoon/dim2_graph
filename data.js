// data.js
document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('generatedData');
  const out = document.getElementById('dataOutput');

  if (!raw) {
    out.textContent = '데이터가 없습니다.';
    return;
  }

  // 예쁘게 포매팅해서 출력
  const data = JSON.parse(raw);
  out.textContent = JSON.stringify(data, null, 2);
});
