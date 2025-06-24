// graph_complete.js
let selectedDimensionData = null;
let originalData = null;

document.addEventListener('DOMContentLoaded', () => {
  // 선택된 차원 데이터 로드
  const selectedDataRaw = sessionStorage.getItem('selectedDimensionData');
  const originalDataRaw = sessionStorage.getItem('generatedData');
  
  if (!selectedDataRaw) {
    document.getElementById('selectedDataInfo').innerHTML = '<p>선택된 차원 데이터가 없습니다. 먼저 차원을 선택해주세요.</p>';
  } else {
    try {
      selectedDimensionData = JSON.parse(selectedDataRaw);
      displaySelectedData();
    } catch (error) {
      document.getElementById('selectedDataInfo').innerHTML = '<p>선택된 데이터 파싱 오류: ' + error.message + '</p>';
    }
  }
  
  if (!originalDataRaw) {
    document.getElementById('originalDataOutput').textContent = '원본 데이터가 없습니다.';
  } else {
    try {
      originalData = JSON.parse(originalDataRaw);
      displayOriginalData();
    } catch (error) {
      document.getElementById('originalDataOutput').textContent = '원본 데이터 파싱 오류: ' + error.message;
    }
  }
});

function displaySelectedData() {
  const selectedDataInfo = document.getElementById('selectedDataInfo');
  
  const data = selectedDimensionData;
  
  selectedDataInfo.innerHTML = `
    <h3>선택된 차원: ${data.selectedDimension}차원</h3>
    <h4>분석 결과</h4>
    <p><strong>데이터의 j:</strong> ${data.analysisResults.j}</p>
    <p><strong>데이터의 k:</strong> ${data.analysisResults.k}</p>
    <p><strong>계산의 n:</strong> ${data.analysisResults.n}</p>
    <p><strong>계산의 m:</strong> ${data.analysisResults.m}</p>
    <p><strong>n+m:</strong> ${data.analysisResults.totalDim}</p>
    <p><strong>String 포함:</strong> ${data.analysisResults.hasString ? 'O' : 'X'}</p>
  `;
}

function displayOriginalData() {
  const originalDataOutput = document.getElementById('originalDataOutput');
  
  // 원본 데이터 JSON 표시
  originalDataOutput.textContent = JSON.stringify(originalData, null, 2);
}