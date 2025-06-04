FROM python:3.13-slim

WORKDIR /app

# requirements.txt 복사 및 설치
COPY docker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 모든 소스 파일 복사
COPY . .

EXPOSE 9889

# server.py 파일이 실제로 존재하는지 확인하고 실행
CMD ["python", "server.py"]