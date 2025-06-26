// Import necessary functions
import { updateWindowDisplay } from '../utils/DOMUtils.js';
import { updateChart } from '../charts/ChartManager.js';
import { updateWindowControls, moveWindow, resizeWindow, updateStepSize, updateWindowInfo } from '../state/WindowManager.js';
import { windowState } from '../../graph_complete.js';

// Creates window control section for data navigaion
// Builds control for individual axis windows with move/resize buttons

export function createWindowSection(dataset, datasetIndex) {
  const section = document.createElement('div');
  section.className = 'window-section';
  section.id = `window-section-${datasetIndex}`;
  section.style.cssText = `
    background: #e8f4f8;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  `;
  
  const title = document.createElement('h4');
  title.textContent = '데이터 윈도우';
  title.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #555;';
  section.appendChild(title);
  
  // 윈도우 컨트롤 컨테이너
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'window-controls-container';
  section.appendChild(controlsContainer);
  
  // 초기에는 첫 번째 시각화 타입 기준으로 윈도우 생성
  const initialVizType = dataset.visualizationTypes[0];
  updateWindowControls(datasetIndex, initialVizType);
  
  return section;
}

export function createAxisWindowControl(axis, datasetIndex) {
  const control = document.createElement('div');
  control.className = 'axis-window-control';
  control.style.cssText = `
    margin-bottom: 0px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
  `;
  
  const label = document.createElement('div');
  label.textContent = `${axis.name}축`;
  label.style.cssText = 'font-weight: bold; font-size: 12px; margin-bottom: 5px;';
  control.appendChild(label);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 3px;
  `;
  
  // < 버튼 (시작점 왼쪽 이동)
  const leftMoveBtn = document.createElement('button');
  leftMoveBtn.textContent = '<';
  leftMoveBtn.className = 'window-btn window-left-move';
  leftMoveBtn.onclick = () => moveWindow(datasetIndex, axis.name, 'left');
  
  // - 버튼 (윈도우 크기 축소)
  const shrinkBtn = document.createElement('button');
  shrinkBtn.textContent = '-';
  shrinkBtn.className = 'window-btn window-shrink';
  shrinkBtn.onclick = () => resizeWindow(datasetIndex, axis.name, 'shrink');
  
  // step 입력 필드
  const stepInput = document.createElement('input');
  stepInput.type = 'number';
  stepInput.className = 'window-step-input';
  
  const axisState = windowState[datasetIndex].axes[axis.name];
  stepInput.value = axisState.stepSize;
  stepInput.min = '0.1';
  stepInput.step = 'any';
  
  stepInput.style.cssText = `
    width: 60px;
    padding: 2px 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 11px;
  `;
  
  stepInput.onchange = () => updateStepSize(datasetIndex, axis.name, parseFloat(stepInput.value));
  
  // + 버튼 (윈도우 크기 확대)
  const expandBtn = document.createElement('button');
  expandBtn.textContent = '+';
  expandBtn.className = 'window-btn window-expand';
  expandBtn.onclick = () => resizeWindow(datasetIndex, axis.name, 'expand');
  
  // > 버튼 (시작점 오른쪽 이동)
  const rightMoveBtn = document.createElement('button');
  rightMoveBtn.textContent = '>';
  rightMoveBtn.className = 'window-btn window-right-move';
  rightMoveBtn.onclick = () => moveWindow(datasetIndex, axis.name, 'right');
  
  // 버튼 스타일 적용
  [leftMoveBtn, shrinkBtn, expandBtn, rightMoveBtn].forEach(btn => {
    btn.style.cssText = `
      padding: 3px 8px;
      font-size: 11px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 3px;
      min-width: 24px;
    `;
    btn.onmouseover = () => btn.style.background = '#f0f0f0';
    btn.onmouseout = () => btn.style.background = 'white';
  });
  
  buttonContainer.appendChild(leftMoveBtn);
  buttonContainer.appendChild(shrinkBtn);
  buttonContainer.appendChild(stepInput);
  buttonContainer.appendChild(expandBtn);
  buttonContainer.appendChild(rightMoveBtn);
  
  control.appendChild(buttonContainer);
  
  // 직접 입력 필드 추가
  const rangeInputContainer = document.createElement('div');
  rangeInputContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    font-size: 11px;
  `;
  
  const rangeLabel = document.createElement('span');
  rangeLabel.textContent = '범위:';
  rangeLabel.style.cssText = 'min-width: 35px;';
  
  const startInput = document.createElement('input');
  startInput.type = 'number';
  startInput.className = 'window-range-input';
  startInput.value = axisState.startValue.toFixed(2);
  startInput.step = 'any';
  startInput.style.cssText = `
    width: 65px;
    padding: 2px 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 11px;
  `;
  
  const rangeSeparator = document.createElement('span');
  rangeSeparator.textContent = '~';
  rangeSeparator.style.cssText = 'padding: 0 3px;';
  
  const endInput = document.createElement('input');
  endInput.type = 'number';
  endInput.className = 'window-range-input';
  endInput.value = axisState.endValue.toFixed(2);
  endInput.step = 'any';
  endInput.style.cssText = `
    width: 65px;
    padding: 2px 4px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 11px;
  `;
  
  // 직접 입력 이벤트 핸들러
  const updateRange = () => {
    const start = parseFloat(startInput.value);
    const end = parseFloat(endInput.value);
    
    if (!isNaN(start) && !isNaN(end) && start < end) {
      axisState.startValue = start;
      axisState.endValue = end;
      axisState.windowSize = end - start;
      
      updateWindowDisplay(datasetIndex, axis.name);
      updateChart(datasetIndex);
    } else {
      // 잘못된 입력이면 원래 값으로 복원
      startInput.value = axisState.startValue.toFixed(2);
      endInput.value = axisState.endValue.toFixed(2);
      alert('시작값은 끝값보다 작아야 합니다.');
    }
  };
  
  startInput.onchange = updateRange;
  endInput.onchange = updateRange;
  
  rangeInputContainer.appendChild(rangeLabel);
  rangeInputContainer.appendChild(startInput);
  rangeInputContainer.appendChild(rangeSeparator);
  rangeInputContainer.appendChild(endInput);
  
  control.appendChild(rangeInputContainer);
  
  // 현재 윈도우 정보 표시
  const infoDiv = document.createElement('div');
  infoDiv.className = 'window-info';
  infoDiv.style.cssText = `
    font-size: 10px;
    color: #666;
    margin-top: 3px;
    text-align: center;
  `;
  
  updateWindowInfo(datasetIndex, axis.name, infoDiv);
  
  control.appendChild(infoDiv);
  
  return control;
}