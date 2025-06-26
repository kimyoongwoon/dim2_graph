// Import necessary functions
import { updateWindowInfo } from '../state/WindowManager.js';
import { windowState } from '../../graph_complete.js';

// DOM mainpulation helper files
// Updates window information displays in the UI

export function updateWindowDisplay(datasetIndex, axisName) {
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const axisControls = card.querySelectorAll('.axis-window-control');
  
  // 해당 축의 컨트롤만 찾아서 업데이트
  axisControls.forEach(control => {
    const label = control.querySelector('div').textContent;
    if (label === `${axisName}축`) {
      const windowInfo = control.querySelector('.window-info');
      if (windowInfo) {
        updateWindowInfo(datasetIndex, axisName, windowInfo);
      }
      
      // 범위 입력 필드 업데이트
      const rangeInputs = control.querySelectorAll('.window-range-input');
      if (rangeInputs.length === 2) {
        const axisState = windowState[datasetIndex].axes[axisName];
        rangeInputs[0].value = axisState.startValue.toFixed(2);
        rangeInputs[1].value = axisState.endValue.toFixed(2);
      }
    }
  });
}

export function showError(message) {
  const container = document.getElementById('datasetsContainer');
  container.innerHTML = `<div class="error">${message}</div>`;
}