// Import necessary functions
import { getAxisRange } from '../utils/DataUtils.js';
import { updateFilterMode } from '../state/updateFilterModel.js';
import { updateChart } from '../charts/ChartManager.js';
import { filters } from '../../graph_complete.js';  // Correct path

// Builds Complete filter control sections for unused axes
// Creates individual filter controls with sliders

export function createFilterSection(dataset, index, allAxes) {
  const section = document.createElement('div');
  section.className = 'filter-section';
  section.style.display = 'none'; // 초기에는 숨김
  
  // 사용된 축 찾기
  const usedAxes = dataset.axes.map(a => a.name);
  const unusedAxes = allAxes.filter(a => !usedAxes.includes(a.name) && a.type !== 'string');
  
  if (unusedAxes.length === 0) {
    return section;
  }
  
  section.style.display = 'block';
  
  const title = document.createElement('h4');
  title.textContent = '데이터 필터';
  section.appendChild(title);
  
  // 각 미사용 축에 대한 필터 생성
  filters[index] = {};
  
  unusedAxes.forEach(axis => {
    const control = createFilterControl(axis, index);
    section.appendChild(control);
  });
  
  return section;
}

export function createFilterControl(axis, datasetIndex) {
  const control = document.createElement('div');
  control.className = 'filter-control';
  
  const label = document.createElement('div');
  label.className = 'filter-label';
  label.textContent = axis.name;
  control.appendChild(label);
  
  // 버튼들
  const buttons = document.createElement('div');
  buttons.className = 'filter-buttons';
  
  const buttonTypes = ['모두', '>=', '=', '<='];
  buttonTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-button';
    if (type === '모두') btn.classList.add('active');
    btn.textContent = type;
    btn.onclick = () => updateFilterMode(datasetIndex, axis.name, type);
    buttons.appendChild(btn);
  });
  
  control.appendChild(buttons);
  
  // 슬라이더와 텍스트 입력 컨테이너
  const sliderContainer = document.createElement('div');
  sliderContainer.style.display = 'flex';
  sliderContainer.style.alignItems = 'center';
  sliderContainer.style.gap = '8px';
  sliderContainer.style.marginTop = '5px';
  
  // 슬라이더
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'filter-slider';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.step = '0.01';
  slider.style.flex = '1'; // 슬라이더가 남은 공간을 차지하도록
  
  // 텍스트 입력 필드
  const textInput = document.createElement('input');
  textInput.type = 'number';
  textInput.className = 'filter-text-input';
  textInput.style.width = '80px';
  textInput.style.padding = '2px 4px';
  textInput.style.border = '1px solid #ccc';
  textInput.style.borderRadius = '3px';
  textInput.style.fontSize = '11px';
  textInput.step = 'any';
  
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'filter-value';
  valueDisplay.textContent = '계산 중...';
  valueDisplay.style.minWidth = '60px';
  valueDisplay.style.textAlign = 'center';
  
  // 데이터에서 최소/최대값 계산
  setTimeout(() => {
    const { min, max } = getAxisRange(axis);
    const initialValue = (min + max) / 2;
    
    // 슬라이더 설정
    slider.min = min;
    slider.max = max;
    slider.value = initialValue;
    slider.step = (max - min) / 1000;
    
    // 텍스트 입력 설정
    textInput.min = min;
    textInput.max = max;
    textInput.value = initialValue.toFixed(3);
    textInput.step = (max - min) / 1000;
    
    valueDisplay.textContent = initialValue.toFixed(3);
    
    // 필터 초기화
    filters[datasetIndex][axis.name] = {
      mode: '모두',
      value: initialValue,
      min: min,
      max: max
    };
  }, 0);
  
  // 슬라이더 변경 이벤트
  slider.oninput = () => {
    const value = parseFloat(slider.value);
    textInput.value = value.toFixed(3);
    valueDisplay.textContent = value.toFixed(3);
    if (filters[datasetIndex][axis.name]) {
      filters[datasetIndex][axis.name].value = value;
      updateChart(datasetIndex);
    }
  };
  
  // 텍스트 입력 변경 이벤트
  const updateFromTextInput = () => {
    let value = parseFloat(textInput.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    // 범위 검증
    if (isNaN(value)) {
      value = parseFloat(slider.value); // 현재 슬라이더 값으로 복원
    } else if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }
    
    // 값 동기화
    textInput.value = value.toFixed(3);
    slider.value = value;
    valueDisplay.textContent = value.toFixed(3);
    
    if (filters[datasetIndex][axis.name]) {
      filters[datasetIndex][axis.name].value = value;
      updateChart(datasetIndex);
    }
  };
  
  textInput.onchange = updateFromTextInput;
  textInput.onblur = updateFromTextInput;
  
  // Enter 키 처리
  textInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      updateFromTextInput();
      textInput.blur(); // 포커스 해제
    }
  };
  
  // 슬라이더 컨테이너에 요소들 추가
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(textInput);
  
  control.appendChild(sliderContainer);
  control.appendChild(valueDisplay);
  
  return control;
}