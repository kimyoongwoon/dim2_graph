// Import necessary functions
import { updateChart } from '../charts/ChartManager.js';
import { filters } from '../../graph_complete.js';

// Updates filter states and UI when user change filter modes

export function updateFilterMode(datasetIndex, axisName, mode) {
  // 버튼 활성화 상태 변경
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const filterControl = Array.from(card.querySelectorAll('.filter-control'))
    .find(fc => fc.querySelector('.filter-label').textContent === axisName);
  
  if (filterControl) {
    const buttons = filterControl.querySelectorAll('.filter-button');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.textContent === mode);
    });
  }
  
  // 필터 상태 업데이트
  if (filters[datasetIndex][axisName]) {
    filters[datasetIndex][axisName].mode = mode;
    updateChart(datasetIndex);
  }
}