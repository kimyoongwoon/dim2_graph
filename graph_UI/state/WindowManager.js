// Import necessary functions
import { updateWindowDisplay } from '../utils/DOMUtils.js';
import { updateChart } from '../charts/ChartManager.js';
import { getUsedAxesForVisualization, findOriginalAxisInfo } from '../utils/DataUtils.js';
import { createAxisWindowControl } from '../core/WindowSection.js';
import { getFilteredDataWithWindow } from '../data/DataProcessor.js';
import { windowState, datasets } from '../../graph_complete.js';

// Handles window poistion change (left/right)
// Manges window size adjustment (expand/shrink)
// Refreshes window UI based on current visualization types

// Sets up initial window state for an axis
// Updates the step size for window navigation
// Updates the display information for window controls


export function moveWindow(datasetIndex, axisName, direction) {
  const axisState = windowState[datasetIndex].axes[axisName];
  if (!axisState) return;
  
  const stepSize = axisState.stepSize;
  
  if (direction === 'left') {
    // 왼쪽 이동: 시작점을 왼쪽으로
    const newStart = axisState.startValue - stepSize;
    const newEnd = axisState.endValue - stepSize;
    
    axisState.startValue = newStart;
    axisState.endValue = newEnd;
  } else if (direction === 'right') {
    // 오른쪽 이동: 시작점을 오른쪽으로
    const newStart = axisState.startValue + stepSize;
    const newEnd = axisState.endValue + stepSize;
    
    axisState.startValue = newStart;
    axisState.endValue = newEnd;
  }
  
  updateWindowDisplay(datasetIndex, axisName);
  updateChart(datasetIndex);
}

export function resizeWindow(datasetIndex, axisName, action) {
  const axisState = windowState[datasetIndex].axes[axisName];
  if (!axisState) return;
  
  const stepSize = axisState.stepSize;
  
  if (action === 'expand') {
    // 윈도우 크기 확대
    axisState.endValue += stepSize;
    axisState.windowSize = axisState.endValue - axisState.startValue;
  } else if (action === 'shrink') {
    // 윈도우 크기 축소
    const newEnd = axisState.endValue - stepSize;
    if (newEnd > axisState.startValue) {
      axisState.endValue = newEnd;
      axisState.windowSize = axisState.endValue - axisState.startValue;
    } else {
      alert('윈도우 크기를 더 줄일 수 없습니다.');
      return;
    }
  }
  
  updateWindowDisplay(datasetIndex, axisName);
  updateChart(datasetIndex);
}

export function updateWindowControls(datasetIndex, vizType) {
  const section = document.getElementById(`window-section-${datasetIndex}`);
  if (!section) return;
  
  const controlsContainer = section.querySelector('.window-controls-container');
  controlsContainer.innerHTML = '';
  
  const dataset = datasets[datasetIndex];
  const usedAxes = getUsedAxesForVisualization(dataset, vizType);
  
  // DEBUG LINES
  

  // 사용되는 축이 없으면 윈도우 섹션 숨김
  if (usedAxes.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  // 윈도우 상태 초기화
  if (!windowState[datasetIndex]) {
    windowState[datasetIndex] = {
      maxDisplayCount: 200,
      axes: {}
    };
  }
  
  // 각 사용되는 축에 대한 컨트롤 생성
  usedAxes.forEach(axis => {
    initializeAxisWindowState(axis, datasetIndex);
    const axisControl = createAxisWindowControl(axis, datasetIndex);
    controlsContainer.appendChild(axisControl);
  });
}

export function initializeAxisWindowState(axis, datasetIndex) {
  if (!windowState[datasetIndex].axes[axis.name]) {
    const originalAxis = findOriginalAxisInfo(axis.name);
    const interval = originalAxis ? originalAxis.interval : 1;
    const min = originalAxis ? originalAxis.min : 0;
    const max = originalAxis ? originalAxis.max : 10;
    
    windowState[datasetIndex].axes[axis.name] = {
      startValue: min,
      endValue: min + 3, // 초기 윈도우 크기 3
      windowSize: 3,
      stepSize: interval,
      interval: interval,
      min: min,
      max: max
    };
  }
}

export function updateStepSize(datasetIndex, axisName, newStepSize) {
  if (newStepSize > 0) {
    windowState[datasetIndex].axes[axisName].stepSize = newStepSize;
  }
}

export function updateWindowInfo(datasetIndex, axisName, infoElement) {
  const axisState = windowState[datasetIndex].axes[axisName];
  
  if (!axisState) {
    infoElement.textContent = 'N/A';
    return;
  }
  
  // 데이터 개수 계산
  const filteredData = getFilteredDataWithWindow(datasetIndex);
  infoElement.textContent = `데이터 개수: ${filteredData.length}개`;
}