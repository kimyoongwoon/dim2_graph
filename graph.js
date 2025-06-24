// graph.js
let globalData = null;
let selectedDimensionData = null;

document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('generatedData');
  
  if (!raw) {
    document.getElementById('analysisInfo').innerHTML = '<p>데이터가 없습니다.</p>';
    return;
  }
  
  try {
    globalData = JSON.parse(raw);
    
    // 데이터 분석 시작
    analyzeData(globalData);
    
  } catch (error) {
    document.getElementById('analysisInfo').innerHTML = '<p>데이터 파싱 오류: ' + error.message + '</p>';
  }
});

function analyzeData(data) {
  const basicData = data.basic_data;
  const dataValue = data.data_value;
  
  if (!dataValue || dataValue.length === 0) {
    document.getElementById('analysisInfo').innerHTML = '<p>분석할 데이터가 없습니다.</p>';
    return;
  }
  
  // 첫 번째 데이터 포인트로 구조 분석
  const firstPoint = dataValue[0];
  const coords = firstPoint[0]; // 입력 데이터 (X1~Xj)
  const value = firstPoint[1];  // 출력 데이터 (Y1~Yk)
  
  // j와 k 계산
  const j = coords.length;
  let k;
  let hasString = false;
  
  // value 타입에 따른 k 계산 및 string 판단
  if (basicData.value_type === 'double') {
    k = 1;
    hasString = false;
  } else if (basicData.value_type === 'string_double') {
    k = 2; // [string, number] 형태
    hasString = true;
  } else if (basicData.value_type === 'array') {
    k = Array.isArray(value) ? value.length : 1;
    hasString = false;
  } else if (basicData.value_type === 'string_array') {
    k = Array.isArray(value) && Array.isArray(value[1]) ? value[1].length + 1 : 2;
    hasString = true;
  }
  
  // n과 m 계산
  let n, m;
  if (hasString) {
    n = j;
    m = k - 1; // string 제외
  } else {
    n = j;
    m = k;
  }
  
  const totalDim = n + m;
  
  // 분석 결과 표시
  displayAnalysisResults(j, k, n, m, totalDim, hasString, basicData.value_type);
  
  // 가능한 차원 결정 및 버튼 생성
  const availableDims = determineAvailableDimensions(hasString, totalDim);
  createDimensionButtons(availableDims, { j, k, n, m, totalDim, hasString, data });
}

function displayAnalysisResults(j, k, n, m, totalDim, hasString, valueType) {
  const analysisInfo = document.getElementById('analysisInfo');
  
  analysisInfo.innerHTML = `
    <h3>데이터 구조 분석</h3>
    <p><strong>입력 데이터 차원 (j):</strong> ${j}</p>
    <p><strong>출력 데이터 차원 (k):</strong> ${k}</p>
    <p><strong>계산된 n:</strong> ${n}</p>
    <p><strong>계산된 m:</strong> ${m}</p>
    <p><strong>총 차원 (n+m):</strong> ${totalDim}</p>
    <p><strong>String 포함 여부:</strong> ${hasString ? 'O' : 'X'}</p>
    <p><strong>Value 타입:</strong> ${valueType}</p>
  `;
}

function determineAvailableDimensions(hasString, totalDim) {
  const availableDims = [];
  
  if (hasString) {
    // string O인 경우
    if (totalDim >= 2 && totalDim < 3) {
      availableDims.push(1, 2, 3);
    } else if (totalDim >= 3) {
      availableDims.push(1, 2, 3, 4);
    }
  } else {
    // string X인 경우
    if (totalDim < 2) {
      // error case
      return [];
    } else if (totalDim >= 2 && totalDim < 3) {
      availableDims.push(1, 2);
    } else if (totalDim >= 3 && totalDim < 4) {
      availableDims.push(1, 2, 3);
    } else if (totalDim >= 4) {
      availableDims.push(1, 2, 3, 4);
    }
  }
  
  return availableDims;
}

function createDimensionButtons(availableDims, analysisData) {
  const dimensionButtons = document.getElementById('dimensionButtons');
  const dimensionSelector = document.getElementById('dimensionSelector');
  
  if (availableDims.length === 0) {
    dimensionSelector.innerHTML = '<p style="color: red;">오류: 데이터 차원이 부족합니다 (n+m < 2)</p>';
    dimensionSelector.style.display = 'block';
    return;
  }
  
  dimensionButtons.innerHTML = '';
  
  for (let i = 1; i <= 4; i++) {
    const button = document.createElement('button');
    button.textContent = `${i}차원 선택`;
    button.onclick = () => selectDimension(i, analysisData);
    
    if (availableDims.includes(i)) {
      button.style.backgroundColor = '#007bff';
      button.style.color = 'white';
      button.style.border = '1px solid #007bff';
    } else {
      button.disabled = true;
      button.style.backgroundColor = '#f8f9fa';
      button.style.color = '#6c757d';
    }
    
    button.style.margin = '5px';
    button.style.padding = '10px 15px';
    button.style.cursor = availableDims.includes(i) ? 'pointer' : 'not-allowed';
    
    dimensionButtons.appendChild(button);
  }
  
  dimensionSelector.style.display = 'block';
}

function selectDimension(selectedDim, analysisData) {
  const { j, k, n, m, totalDim, hasString, data } = analysisData;
  
  // 선택된 차원 정보만 저장
  selectedDimensionData = {
    selectedDimension: selectedDim,
    analysisResults: {
      j: j,
      k: k,
      n: n,
      m: m,
      totalDim: totalDim,
      hasString: hasString
    },
    originalData: data
  };
  
  // 선택 결과 표시
  displaySelectedDimensionInfo(selectedDimensionData);
  
  // Export 버튼 활성화
  setupExportButton();
}

function displaySelectedDimensionInfo(dimData) {
  const selectedDimensionInfo = document.getElementById('selectedDimensionInfo');
  const exportResults = document.getElementById('exportResults');
  
  selectedDimensionInfo.innerHTML = `
    <h3>선택된 차원: ${dimData.selectedDimension}차원</h3>
    <p><strong>데이터의 j:</strong> ${dimData.analysisResults.j}</p>
    <p><strong>데이터의 k:</strong> ${dimData.analysisResults.k}</p>
    <p><strong>계산의 n:</strong> ${dimData.analysisResults.n}</p>
    <p><strong>계산의 m:</strong> ${dimData.analysisResults.m}</p>
    <p><strong>n+m:</strong> ${dimData.analysisResults.totalDim}</p>
  `;
  
  exportResults.style.display = 'block';
}

function setupExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  
  exportBtn.onclick = () => {
    if (selectedDimensionData) {
      // 세션 스토리지에 처리된 데이터 저장
      sessionStorage.setItem('selectedDimensionData', JSON.stringify(selectedDimensionData));
      
      // graph_complete.html로 이동
      window.location.href = 'graph_complete.html';
    }
  };
}