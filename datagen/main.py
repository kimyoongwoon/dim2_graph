# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import uvicorn
import logging
from datagen import generate_all
from datagen_function import AxisSpec

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="고차원 데이터 생성 API", version="1.0.0")

# CORS 설정 - 개발환경용으로 단순화
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발환경용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AxisInput(BaseModel):
    name: str
    minimum: float
    maximum: float
    interval: float
    allow_duplicates: bool

class GenerateRequest(BaseModel):
    axes: List[AxisInput]
    value_type: str
    num_points: int

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "고차원 데이터 생성 API가 정상 작동 중입니다"}

@app.post("/generate")
async def generate(req: GenerateRequest):
    try:
        logger.info(f"Generate request received: {req.num_points} points, {len(req.axes)} axes")
        
        # 입력 검증
        if not req.axes:
            raise HTTPException(status_code=400, detail="최소 1개의 축이 필요합니다")
        
        if req.num_points <= 0:
            raise HTTPException(status_code=400, detail="포인트 수는 양수여야 합니다")
        
        if req.value_type not in ["double", "string_double", "array", "string_array"]:
            raise HTTPException(status_code=400, detail="지원하지 않는 값 타입입니다")
        
        # AxisSpec 객체로 변환
        specs = []
        for axis in req.axes:
            spec = AxisSpec(
                name=axis.name,
                minimum=axis.minimum,
                maximum=axis.maximum,
                interval=axis.interval,
                allow_duplicates=axis.allow_duplicates
            )
            specs.append(spec)
        
        # 데이터 생성
        result = generate_all(specs, req.value_type, req.num_points)
        
        logger.info(f"Successfully generated {len(result['data_value'])} data points")
        
        return {
            "success": True,
            "data": result,
            "message": f"{len(result['data_value'])}개의 데이터 포인트가 생성되었습니다"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"데이터 생성 중 오류 발생: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API 서버가 정상 작동 중입니다"}

if __name__ == "__main__":
    print("Starting FastAPI server...")
    print("API 문서: http://localhost:8000/docs")
    print("서버 상태: http://localhost:8000/health")
    uvicorn.run(
        "main:app",  # 모듈:앱 형태로 지정
        host="127.0.0.1", 
        port=8000, 
        reload=True,
        log_level="info"
    )