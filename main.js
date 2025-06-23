// main.js
import { fetchGeneratedData, checkServerHealth } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 서버 상태 확인
  const isServerRunning = await checkServerHealth();
  if (!isServerRunning) {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px;';
    statusDiv.innerHTML = '⚠️ 서버가 실행되지 않았습니다. <code>python main.py</code>로 서버를 시작해주세요.';
    document.body.insertBefore(statusDiv, document.body.firstChild);
  }

  const dimCount      = document.getElementById('dimCount');
  const axisContainer = document.getElementById('axisContainer');
  const valueType     = document.getElementById('valueType');
  const numPoints     = document.getElementById('numPoints');
  const genBtn        = document.getElementById('generateBtn');
  const viewGraphBtn  = document.getElementById('viewGraphBtn');
  const viewDataBtn   = document.getElementById('viewDataBtn');

  function renderAxisFields(n) {
    axisContainer.innerHTML = '';
    for (let i = 0; i < n; i++) {
      axisContainer.insertAdjacentHTML('beforeend', `
        <fieldset style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
          <legend><strong>Axis ${i + 1}</strong></legend>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px 10px; align-items: center;">
            <label>이름:</label>
            <input class="ax-name" value="x${i}" style="padding: 4px;">
            
            <label>최소:</label>
            <input type="number" class="ax-min" value="0" style="padding: 4px;">
            
            <label>최대:</label>
            <input type="number" class="ax-max" value="10" style="padding: 4px;">
            
            <label>간격:</label>
            <input type="number" class="ax-int" value="1" step="0.1" style="padding: 4px;">
            
            <label>중복허용:</label>
            <input type="checkbox" class="ax-dup" checked style="transform: scale(1.2);">
          </div>
        </fieldset>
      `);
    }
    genBtn.disabled = false;
  }

  // 초기 렌더링
  renderAxisFields(parseInt(dimCount.value, 10));
  
  // 차원 수 변경 이벤트
  dimCount.addEventListener('change', () => {
    const n = parseInt(dimCount.value, 10);
    if (n >= 1 && n <= 10) { // 최대 10차원으로 제한
      renderAxisFields(n);
    } else {
      alert('축 개수는 1~10 사이여야 합니다.');
      dimCount.value = 2;
    }
  });

  // 데이터 생성 이벤트
  genBtn.addEventListener('click', async () => {
    // 버튼 비활성화
    genBtn.disabled = true;
    genBtn.textContent = '생성 중...';
    
    try {
      // 입력값 검증
      const numPointsValue = parseInt(numPoints.value, 10);
      if (numPointsValue <= 0 || numPointsValue > 10000) {
        throw new Error('데이터 갯수는 1~10000 사이여야 합니다.');
      }

      // 축 데이터 수집
      const axes = [];
      const axisNames = axisContainer.querySelectorAll('.ax-name');
      const axisMinimums = axisContainer.querySelectorAll('.ax-min');
      const axisMaximums = axisContainer.querySelectorAll('.ax-max');
      const axisIntervals = axisContainer.querySelectorAll('.ax-int');
      const axisDuplicates = axisContainer.querySelectorAll('.ax-dup');

      for (let i = 0; i < axisNames.length; i++) {
        const minimum = parseFloat(axisMinimums[i].value);
        const maximum = parseFloat(axisMaximums[i].value);
        const interval = parseFloat(axisIntervals[i].value);

        // 유효성 검증
        if (minimum >= maximum) {
          throw new Error(`축 ${i + 1}: 최소값이 최대값보다 크거나 같습니다.`);
        }
        if (interval <= 0) {
          throw new Error(`축 ${i + 1}: 간격은 양수여야 합니다.`);
        }

        axes.push({
          name: axisNames[i].value || `x${i}`,
          minimum: minimum,
          maximum: maximum,
          interval: interval,
          allow_duplicates: axisDuplicates[i].checked
        });
      }

      console.log('생성 요청:', { axes, valueType: valueType.value, numPoints: numPointsValue });

      // API 호출
      const response = await fetchGeneratedData({
        axes,
        valueType: valueType.value,
        numPoints: numPointsValue
      });

      // 세션 스토리지에 저장
      sessionStorage.setItem('generatedData', JSON.stringify(response.data));
      
      // 버튼 활성화
      viewGraphBtn.disabled = false;
      viewDataBtn.disabled = false;
      
      // 성공 메시지
      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'background: #efe; border: 1px solid #cfc; padding: 10px; margin: 10px 0; border-radius: 4px;';
      successMsg.textContent = response.message || '데이터가 성공적으로 생성되었습니다!';
      
      // 기존 메시지 제거
      const existingMsg = document.querySelector('.success-message, .error-message');
      if (existingMsg) existingMsg.remove();
      
      successMsg.className = 'success-message';
      genBtn.parentNode.insertBefore(successMsg, genBtn.nextSibling);
      
      // 3초 후 메시지 제거
      setTimeout(() => successMsg.remove(), 3000);

    } catch (error) {
      console.error('데이터 생성 실패:', error);
      
      // 에러 메시지 표시
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px;';
      errorMsg.textContent = error.message || '데이터 생성에 실패했습니다.';
      
      // 기존 메시지 제거
      const existingMsg = document.querySelector('.success-message, .error-message');
      if (existingMsg) existingMsg.remove();
      
      errorMsg.className = 'error-message';
      genBtn.parentNode.insertBefore(errorMsg, genBtn.nextSibling);
      
      // 5초 후 메시지 제거
      setTimeout(() => errorMsg.remove(), 5000);
      
    } finally {
      // 버튼 복원
      genBtn.disabled = false;
      genBtn.textContent = '생성하기';
    }
  });

  // 페이지 이동 이벤트
  viewGraphBtn.addEventListener('click', () => {
    window.location.href = 'graph.html';
  });
  
  viewDataBtn.addEventListener('click', () => {
    window.location.href = 'data.html';
  });
});