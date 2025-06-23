from typing import List, Dict, Any
from datagen_function import AxisSpec, generate_point
import random
import logging

logger = logging.getLogger(__name__)

def generate_all(axis_specs: List[AxisSpec],
                 value_type: str,
                 num_points: int) -> Dict[str, Any]:
    """
    고차원 데이터 생성 함수
    
    Returns:
    - basic_data: {
        dim: 차원 수,
        axes: [ { name, min, max, interval, allow_dup } ... ],
        value_type: 전달된 타입
      }
    - data_value: [ [coords], value ] 쌍의 리스트
    """
    logger.info(f"Generating {num_points} points with {len(axis_specs)} axes")
    
    basic_data = {
        "dim": len(axis_specs),
        "axes": [
            {
                "name": ax.name,
                "min": ax.minimum,
                "max": ax.maximum,
                "interval": ax.interval,
                "allow_dup": ax.allow_duplicates
            } for ax in axis_specs
        ],
        "value_type": value_type
    }

    data_value: List[Any] = []
    seen = set()
    
    # 배열 크기를 한 번만 정의
    arr_num = random.randint(2, 5)
    
    attempts = 0
    max_attempts = num_points * 20  # 더 많은 시도 허용
    
    while len(data_value) < num_points and attempts < max_attempts:
        try:
            coords, val = generate_point(axis_specs, value_type, arr_num)
            
            # 중복 체크용 키 (coords + value)
            coords_tuple = tuple(coords)
            key = coords_tuple + (str(val),)
            
            # 모든 축이 allow_duplicates가 True이면 중복 허용
            allow_all_duplicates = all(ax.allow_duplicates for ax in axis_specs)
            
            if allow_all_duplicates or key not in seen:
                data_value.append([coords, val])
                seen.add(key)
            
        except Exception as e:
            logger.warning(f"Error generating point at attempt {attempts}: {e}")
        
        attempts += 1
    
    if len(data_value) < num_points:
        logger.warning(f"Could only generate {len(data_value)} out of {num_points} requested points")
    
    logger.info(f"Successfully generated {len(data_value)} data points")
    return {"basic_data": basic_data, "data_value": data_value}