// Import necessary functions
import { createVisualization } from '../../visualizations/core/chart_factory.js';
import { getUsedAxesForVisualization } from '../utils/DataUtils.js';
import { getFilteredDataWithWindow } from '../data/DataProcessor.js';
import { updateWindowControls } from '../state/WindowManager.js';
import { datasets, charts, filters, windowState, originalData, scalingConfigs, colorScalingConfigs } from '../../graph_complete.js';

// Creates Chart.js instance with configuration
// Refreshes charts when filters or windows change
// Handles switching between visualization types

export function createChart(datasetIndex, vizTypeIndex) {
  const dataset = datasets[datasetIndex];
  const vizType = dataset.visualizationTypes[vizTypeIndex];
  const canvas = document.getElementById(`chart-${datasetIndex}`);
  const scalingConfig = scalingConfigs[datasetIndex] || { type: 'default', params: {} };
  const colorScalingConfig = colorScalingConfigs[datasetIndex] || { type: 'default' };
  
  // 기존 차트 제거
  if (charts[datasetIndex]) {
    charts[datasetIndex].destroy();
  }
  
  // 새 차트 생성
  try {
    const filter = filters[datasetIndex] || {};
    
    // 윈도우가 초기화되지 않았다면 기존 방식 사용
    if (!windowState[datasetIndex]) {
      const chartConfig = createVisualization(dataset, vizType, originalData, filter, scalingConfig, colorScalingConfig);
      charts[datasetIndex] = new Chart(canvas, chartConfig);
      return;
    }
    
    // 윈도우 필터가 적용된 데이터 가져오기
    const windowFilteredData = getFilteredDataWithWindow(datasetIndex);
    
    // 데이터 개수 확인
    if (windowFilteredData.length > windowState[datasetIndex].maxDisplayCount) {
      canvas.parentElement.innerHTML = `<div class="error">데이터 갯수가 너무 많습니다 (${windowFilteredData.length}개).</div>`;
      return;
    }
    
    // 윈도우 필터링된 데이터로 차트 생성
    const filteredOriginalData = {
      basic_data: originalData.basic_data,
      data_value: windowFilteredData.map(d => [d._coords, d._value])
    };
    
    const chartConfig = createVisualization(dataset, vizType, filteredOriginalData, {}, scalingConfig, colorScalingConfig);
    
    // 윈도우 범위를 차트에 강제 적용
    const usedAxes = getUsedAxesForVisualization(dataset, vizType);
    
    if (chartConfig.options && chartConfig.options.scales) {
      usedAxes.forEach((axis, index) => {
        const axisState = windowState[datasetIndex].axes[axis.name];
        if (axisState) {
          if (index === 0 && chartConfig.options.scales.x) {
            // X축 범위 설정
            chartConfig.options.scales.x.min = axisState.startValue;
            chartConfig.options.scales.x.max = axisState.endValue;
          } else if (index === 1 && chartConfig.options.scales.y) {
            // Y축 범위 설정
            chartConfig.options.scales.y.min = axisState.startValue;
            chartConfig.options.scales.y.max = axisState.endValue;
          }
        }
      });
    }
    
    charts[datasetIndex] = new Chart(canvas, chartConfig);
    
  } catch (error) {
    console.error(`차트 생성 오류 (dataset ${datasetIndex}):`, error);
    canvas.parentElement.innerHTML = `<div class="error">차트 생성 실패: ${error.message}</div>`;
  }
}

export function updateChart(datasetIndex) {
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const activeButton = card.querySelector('.viz-button.active');
  const vizTypeIndex = Array.from(card.querySelectorAll('.viz-button')).indexOf(activeButton);
  
  // 필터 변경 시 데이터 개수 확인
  if (windowState[datasetIndex]) {
    const filteredData = getFilteredDataWithWindow(datasetIndex);
    
    if (filteredData.length > windowState[datasetIndex].maxDisplayCount) {
      const canvas = document.getElementById(`chart-${datasetIndex}`);
      canvas.parentElement.innerHTML = `<div class="error">데이터 갯수가 너무 많습니다 (${filteredData.length}개). 윈도우를 조정해주세요.</div>`;
      return;
    }
  }
  
  createChart(datasetIndex, vizTypeIndex);
}

export function switchVisualization(datasetIndex, vizTypeIndex) {
  // 버튼 활성화 상태 변경
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const buttons = card.querySelectorAll('.viz-button');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === vizTypeIndex);
  });
  
  // 윈도우 컨트롤 업데이트
  const dataset = datasets[datasetIndex];
  const vizType = dataset.visualizationTypes[vizTypeIndex];
  updateWindowControls(datasetIndex, vizType);
  
  // 차트 재생성
  createChart(datasetIndex, vizTypeIndex);
}

export function getActiveVisualizationType(datasetIndex) {
  const card = document.getElementById(`dataset-${datasetIndex}`);
  const activeButton = card.querySelector('.viz-button.active');
  const vizTypeIndex = Array.from(card.querySelectorAll('.viz-button')).indexOf(activeButton);
  const dataset = datasets[datasetIndex];
  return dataset.visualizationTypes[vizTypeIndex];
}