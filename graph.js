// graph.js
import { fetchGeneratedData } from './api.js'; // 필요하다면 graph 페이지에서도 재사용

document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('generatedData');
  if (!raw) {
    document.getElementById('graphOutput').textContent = '데이터가 없습니다.';
    return;
  }
  const data = JSON.parse(raw);
  document.getElementById('graphOutput').textContent = JSON.stringify(data, null, 2);
  // ▶ Chart.js 로직도 이 안에 추가
});
