# 환경변수 설정

## docker-compose.yml

`파일 위치`
/volume1/docker/writemd/docker-compose.yml
/volume1/docker/writemd/.env

`.env`
```
# Database
MYSQL_ROOT_PASSWORD=mysql_root_password
MYSQL_USER_PASSWORD=mysql_user_password

# Redis
REDIS_PASSWORD=redis_password

# GitHub OAuth
GITHUB_CLIENT_ID=github_client_id
GITHUB_CLIENT_SECRET=github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8888/login/oauth2/code/github
// https://api.writemd.space/login/oauth2/code/github

# Frontend
FRONTEND_URL=frontend_url(http://localhost:5173)
// https://www.writemd.space

# Cloudflare
CLOUDFLARE_TUNNEL_TOKEN=cloudflare_tunnel_token

# Github Runner
RUNNER_TOKEN=github_runner_token 
# Registration Token 일회용 (A로 시작)

ACCESS_TOKEN=github_access_token
# Personal Access Token (ghp_로 시작)
GitHub > Settings > Developer settings > Personal access tokens
권한 설정
 - repo (모든 하위 권한 포함)
 - workflow
 - admin:repo_hook
 - read:org

# JWT_SECRET
JWT_SECRET=16진수_문자열
HS256(HMAC-SHA256) 서명에 사용되는 비밀 키(64바이트를 16진수로 표현)
키 생성(터미널): openssl rand -hex 64
```

## Git Actions Secret

`Repository` > `Settings` > `Secrets and variables` > `New Repository secret`

VITE_API_URL=backend_url(http://localhost:8888)
// https://api.writemd.space

## GitHub Developer Settings

`https://github.com/settings/profile` > `Developer Settings` > `OAuth Apps` > `project_name`

Homepage URL
`http://localhost:5173`
// https://www.writemd.space

Authorization callback URL
`http://localhost:8888/login/oauth2/code/github`
// https://api.writemd.space/login/oauth2/code/github