#!/bin/bash
echo "GitHub Runner 상태 확인 중..."

if docker ps | grep -q github-runner; then
    echo "GitHub Runner가 이미 실행 중입니다."
else
    echo "GitHub Runner가 실행되지 않음. 시작 중..."
    
    # 기존 컨테이너 정리 (있다면)
    docker rm -f github-runner 2>/dev/null || true
    
    docker run -d --restart unless-stopped \
      --name github-runner \
      -e REPO_URL="https://github.com/yi5oyu/writemd" \
      -e RUNNER_TOKEN="$GITHUB_RUNNER_TOKEN" \
      -e RUNNER_NAME="synology-runner" \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v /volume1/docker/writemd:/workspace \
      myoung34/github-runner:latest
    
    echo "Runner 시작 대기 중..."
    sleep 10
    echo "GitHub Runner 시작 완료!"
fi