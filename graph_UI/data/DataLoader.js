// Import necessary functions
import { showError } from '../utils/DOMUtils.js';
import { setSelectedDimensionData, setOriginalData, generateAndDisplayDatasets, selectedDimensionData } from '../../graph_complete.js';

// Loads and parses data from session storage
// Shows information about selected dimensions

export function loadData() {
  // 선택된 차원 데이터 로드
  const selectedDataRaw = sessionStorage.getItem('selectedDimensionData');
  const originalDataRaw = sessionStorage.getItem('generatedData');
  
  if (!selectedDataRaw) {
    showError('선택된 차원 데이터가 없습니다. 먼저 차원을 선택해주세요.');
    return;
  }
  
  try {
    setSelectedDimensionData(JSON.parse(selectedDataRaw));
    setOriginalData(originalDataRaw ? JSON.parse(originalDataRaw) : null);
    
    displaySelectedData();
    generateAndDisplayDatasets();
  } catch (error) {
    showError('데이터 파싱 오류: ' + error.message);
  }
}

export function displaySelectedData() {
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