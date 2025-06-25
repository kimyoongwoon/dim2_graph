// graph_complete.js
import { generateDatasets } from './dataset_generator.js';
import { createVisualization } from './visualizer.js';

let selectedDimensionData = null;
let originalData = null;
let datasets = [];
let charts = {}; // 차트 인스턴스 저장
let filters = {}; // 필터 상태 저장

document.addEventListener('DOMContentLoaded', () => {
  loadData();
});

function loadData() {
  // 선택된 차원 데이터 로드
  const selectedDataRaw = sessionStorage.getItem('selectedDimensionData');
  const originalDataRaw = sessionStorage.getItem('generatedData');
  
  if (!selectedDataRaw) {
    showError('선택된 차원 데이터가 없습니다. 먼저 차원을 선택해주세요.');
    return;
  }
  
  try {
    selectedDimensionData = JSON.parse(selectedDataRaw);
    originalData = originalDataRaw ? JSON.parse(originalDataRaw) : null;
    
    displaySelectedData();
    generateAndDisplayDatasets();
  } catch (error) {
    showError('데이터 파싱 오류: ' + error.message);
  }
}

function displaySelectedData() {
  const selectedDataInfo = document.getElementById('selectedDataInfo');
  const data = selectedDimensionData;
  
  selectedDataInfo.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
      <div><strong>선택된 차원:</strong> ${data.selectedDimension}차원</div>
      <div><strong>입력 차원 (j):</strong> ${data.analysisResults.j}</div>
      <div><strong>출력 차원 (k):</strong> ${data.analysisResults.k}</div>
      <div><strong>n:</strong> ${data.analysisResults.n}</div>
      <div><strong>m:</strong> ${data.analysisResults.m}</div>
      <div><strong>n+m:</strong> ${data.analysisResults.totalDim}</div>
      <div><strong>String 포함:</strong> ${data.analysisResults.hasString ? 'O' : 'X'}</div>
    </div>
  `;
}

function generateAndDisplayDatasets() {
  const container = document.getElementById('datasetsContainer');
  const countDiv = document.getElementById('datasetCount');
  
  try {
    // 데이터셋 생성
    const result = generateDatasets(selectedDimensionData, originalData);
    const allAxes = result.allAxes || [];
    datasets = result.datasets || [];
    
    if (!datasets || datasets.length === 0) {
      container.innerHTML = '<div class="error">생성된 데이터셋이 없습니다.</div>';
      return;
    }
    
    countDiv.innerHTML = `<p>총 <strong>${datasets.length}</strong>개의 데이터셋이 생성되었습니다.</p>`;
    
    // 데이터셋 카드 생성
    container.innerHTML = '';
    datasets.forEach((dataset, index) => {
      const card = createDatasetCard(dataset, index, allAxes);
      container.appendChild(card);
    });
    
  } catch (error) {
    showError('데이터셋 생성 오류: ' + error.message);
    console.error(error);
  }
}

function createDatasetCard(dataset, index, allAxes) {
  const card = document.createElement('div');
  card.className = 'dataset-card';
  card.id = `dataset-${index}`;
  
  // 제목
  const title = document.createElement('h3');
  title.textContent = dataset.name;
  card.appendChild(title);
  
  // 시각화 타입 버튼들
  const vizButtons = document.createElement('div');
  vizButtons.className = 'viz-buttons';
  
  dataset.visualizationTypes.forEach((vizType, vizIndex) => {
    const button = document.createElement('button');
    button.className = 'viz-button';
    if (vizIndex === 0) button.classList.add('active');
    button.textContent = vizType.name;
    button.onclick = () => switchVisualization(index, vizIndex);
    vizButtons.appendChild(button);
  });
  
  card.appendChild(vizButtons);
  
  // 필터 섹션
  const filterSection = createFilterSection(dataset, index, allAxes);
  card.appendChild(filterSection);
  
  // 차트 컨테이너
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = `chart-${index}`;
  chartContainer.appendChild(canvas);
  card.appendChild(chartContainer);
  
  // 데이터셋 정보
  const info = document.createElement('div');
  info.className = 'dataset-info';
  info.innerHTML = `
    <strong>축 구성:</strong> ${dataset.axes.map(a => a.name).join(', ')}<br>
    <strong>데이터 타입:</strong> ${dataset.dataType}
  `;
  card.appendChild(info);
  
  // 초기 시각화 생성
  setTimeout(() => {
    createChart(index, 0);
  }, 100);
  
  return card;
}

function createFilterSection(dataset, datasetIndex, allAxes) {
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
  filters[datasetIndex] = {};
  
  unusedAxes.forEach(axis => {
    const control = createFilterControl(axis, datasetIndex);
    section.appendChild(control);
  });
  
  return section;
}

function createFilterControl(axis, datasetIndex) {
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

function getAxisRange(axis) {
  if (!originalData || !originalData.data_value) {
    return { min: 0, max: 100 };
  }
  
  const values = originalData.data_value.map(point => {
    const coords = point[0];
    const value = point[1];
    
    if (axis.type === 'input') {
      return coords[axis.index];
    } else if (axis.type === 'output') {
      if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          return value[1][axis.index];
        } else {
          return value[axis.index];
        }
      } else {
        return value;
      }
    }
  }).filter(v => v !== undefined && !isNaN(v));
  
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function updateFilterMode(datasetIndex, axisName, mode) {
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

function updateChart(datasetIndex) {
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const activeButton = card.querySelector('.viz-button.active');
  const vizTypeIndex = Array.from(card.querySelectorAll('.viz-button')).indexOf(activeButton);
  createChart(datasetIndex, vizTypeIndex);
}

function switchVisualization(datasetIndex, vizTypeIndex) {
  // 버튼 활성화 상태 변경
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const buttons = card.querySelectorAll('.viz-button');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === vizTypeIndex);
  });
  
  // 차트 재생성
  createChart(datasetIndex, vizTypeIndex);
}

function createChart(datasetIndex, vizTypeIndex) {
  const dataset = datasets[datasetIndex];
  const vizType = dataset.visualizationTypes[vizTypeIndex];
  const canvas = document.getElementById(`chart-${datasetIndex}`);
  
  // 기존 차트 제거
  if (charts[datasetIndex]) {
    charts[datasetIndex].destroy();
  }
  
  // 새 차트 생성
  try {
    const filter = filters[datasetIndex] || {};
    const chartConfig = createVisualization(dataset, vizType, originalData, filter);
    charts[datasetIndex] = new Chart(canvas, chartConfig);
  } catch (error) {
    console.error(`차트 생성 오류 (dataset ${datasetIndex}):`, error);
    canvas.parentElement.innerHTML = `<div class="error">차트 생성 실패: ${error.message}</div>`;
  }
}

function showError(message) {
  const container = document.getElementById('datasetsContainer');
  container.innerHTML = `<div class="error">${message}</div>`;
}