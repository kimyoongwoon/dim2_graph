import { loadData } from './graph_UI/data/index.js';

// Import from graph_UI

// graph_complete.js
import { generateDatasets } from './dataset_generator.js';

// Modular imports
import { createDatasetCard } from './graph_UI/core/index.js';
import { showError } from './graph_UI/utils/index.js';

export let datasets = [];
export let charts = {}; // 차트 인스턴스 저장
export let filters = {}; // 필터 상태 저장
export let windowState = {}; // 윈도우 상태 저장
export let scalingConfigs = {}; // Size Scaling Config per dataset
export let colorScalingConfigs = {}; // Color Scaling Configurations per dataset
// Add setter functions for Variables

export let selectedDimensionData = null;
export let originalData = null;

export function setSelectedDimensionData(data) {
  selectedDimensionData = data;
}

export function setOriginalData(data) {
  originalData = data;
}

// 각 시각화 타입별로 실제 사용하는 축 정의
export const VISUALIZATION_AXIS_MAP = {
  // 1D
  'line1d': ['x'],
  'category': [],
  
  // 2D
  'size': ['x'],
  'color': ['x'],
  'scatter': ['x', 'y'],
  
  // 2D String
  'bar_size': ['x'],
  'bar_color': ['x'],
  'bar': ['x', 'y'],
  
  // 3D
  'size_color': ['x'],
  'scatter_size': ['x', 'y'],
  'scatter_color': ['x', 'y'],
  
  // 3D String
  'grouped_bar_size': ['x', 'y'],
  'grouped_bar': ['x', 'y'],
  'grouped_bar_color': ['x', 'y'],
  
  // 4D
  'scatter_size_color': ['x', 'y'],
  
  // 4D String
  'grouped_scatter_size_color': ['x', 'y']
};

export function generateAndDisplayDatasets() {
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


document.addEventListener('DOMContentLoaded', () => {
  loadData();
});