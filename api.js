// api.js
const BASE_URL = 'http://localhost:8000';

export async function fetchGeneratedData({ axes, valueType, numPoints }) {
  console.log('API 요청 시작:', { axes, valueType, numPoints });
  
  try {
    const requestBody = {
      axes,
      value_type: valueType,
      num_points: numPoints
    };
    
    console.log('요청 데이터:', requestBody);
    
    const res = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('응답 상태:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API 오류 응답:', errorText);
      throw new Error(`API 오류 (${res.status}): ${errorText}`);
    }
    
    const data = await res.json();
    console.log('응답 데이터:', data);
    
    return data;
    
  } catch (error) {
    console.error('API 호출 실패:', error);
    
    // 네트워크 오류인지 확인
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`서버에 연결할 수 없습니다. 서버가 ${BASE_URL}에서 실행 중인지 확인해주세요.`);
    }
    
    throw error;
  }
}

// 서버 상태 확인 함수 추가
export async function checkServerHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      console.log('서버 상태:', data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return false;
  }
}