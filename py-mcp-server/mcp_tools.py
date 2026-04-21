import os
import base64
from githubkit import GitHub
from mcp.server.fastmcp import FastMCP
from typing import List, Dict, Any
from dotenv import load_dotenv
from git.repo import create_github_client, get_repository_tree, get_repository_tree_with_metadata

load_dotenv()

github_token = os.getenv("GITHUB_TOKEN")

mcp = FastMCP("py-mcp-server")

@mcp.tool(description="GitHub 레포지토리의 폴더 구조를 보여줍니다.")
async def githubRepoStructure(owner: str, repo: str, branch: str = "", max_depth: int = 0, access_token: str = "") -> str:
    """
    GitHub 레포지토리 구조를 목록 형식으로 반환합니다.
    
    Args:
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        access_token (str, optional): GitHub 접근 토큰
        
    Returns:
        str: 레포지토리 경로 목록
    """
    
    try:
        token_to_use = access_token if access_token else github_token

        # GitHub 객체 생성
        github_client = create_github_client(token_to_use)
        
        # 레포지토리/트리 데이터 가져오기
        full_repo, branch, paths = await get_repository_tree(
            github_client, owner, repo, branch, max_depth
        )
        
        # 경로 목록 출력
        result = [f"{full_repo} ({branch})"]
        result.extend(paths)

        return "\n".join(result)
    
    except ValueError as e:
        # 인증 관련 오류
        return str(e)
    except Exception as e:
        # 기타 오류
        return f"GitHub 레포지토리 구조를 가져오는 중 오류가 발생했습니다: {str(e)}"

@mcp.tool(description="GitHub 레포지토리의 파일 목록과 SHA를 보여줍니다.")
async def githubRepoFiles(owner: str, repo: str, branch: str = "", max_depth: int = 0, access_token: str = "") -> str:
    """
    GitHub 레포지토리의 파일 목록과 SHA를 반환합니다.
    
    Args:
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        access_token (str, optional): GitHub 접근 토큰
        
    Returns:
        str: 레포지토리 파일 목록과 SHA
    """
    
    try:
        token_to_use = access_token if access_token else github_token

        # GitHub 객체 생성
        github_client = create_github_client(token_to_use)
        
        # 레포지토리/트리 데이터 가져오기
        full_repo, branch, items = await get_repository_tree_with_metadata(
            github_client, owner, repo, branch, max_depth
        )
        
        # 결과 포맷팅
        result = [f"{full_repo} ({branch})"]
        result.append("")
        result.append("PATH | TYPE | SHA")
        result.append("----|------|----")
        
        for item in items:
            result.append(f"{item['path']} | {item['type']} | {item['sha']}")
        
        return "\n".join(result)
    
    except ValueError as e:
        # 인증 관련 오류
        return str(e)
    except Exception as e:
        # 기타 오류
        return f"GitHub 레포지토리 파일 목록을 가져오는 중 오류가 발생했습니다: {str(e)}"

@mcp.tool(description="GitHub 레포지토리의 특정 파일 내용을 가져옵니다.")
async def githubFileContent(owner: str, repo: str, path: str, branch: str = "", access_token: str = "") -> str:
    """
    GitHub 레포지토리의 특정 파일 내용을 가져옵니다.
    
    Args:
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        path (str): 파일 경로
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        access_token (str, optional): GitHub 접근 토큰
        
    Returns:
        str: 파일 내용
    """
    
    try:
        token_to_use = access_token if access_token else github_token

        # GitHub 객체 생성
        github_client = create_github_client(token_to_use)
        
        # 레포지토리 형식 처리
        if "/" in repo:
            parts = repo.split('/')
            if len(parts) == 2:
                owner, repo = parts
        
        # 기본 브랜치 조회
        if not branch or branch.strip() == "":
            try:
                repo_resp = await github_client.rest.repos.async_get(owner, repo)
                branch = repo_resp.parsed_data.default_branch
            except Exception as e:
                raise Exception(f"레포지토리를 찾을 수 없습니다: {str(e)}")
        
        # 파일 내용 가져오기
        try:
            content_resp = await github_client.rest.repos.async_get_content(owner, repo, path, ref=branch)
            file_data = content_resp.parsed_data
            
            # 응답이 리스트인 경우 (디렉토리 경로)
            if isinstance(file_data, list):
                raise Exception("디렉토리 경로가 지정되었습니다. 파일 경로를 지정해주세요.")
            
            # 파일 정보 및 내용 반환
            header = f"파일: {path} (브랜치: {branch})\n"
            header += f"SHA: {getattr(file_data, 'sha', 'unknown')}\n"
            header += f"크기: {getattr(file_data, 'size', 0)} bytes\n"
            header += "=" * 40 + "\n\n"
            
            # 내용 추출 및 Base64 디코딩
            encoded_content = getattr(file_data, 'content', '')
            if not encoded_content:
                return header + "(빈 파일이거나 내용을 읽을 수 없습니다.)"
                
            content = base64.b64decode(encoded_content).decode('utf-8')
            
            return header + content
            
        except Exception as e:
            raise Exception(f"파일 내용을 가져오는 중 오류가 발생했습니다: {str(e)}")
    
    except ValueError as e:
        # 인증 관련 오류
        return str(e)
    except Exception as e:
        # 기타 오류
        return f"GitHub 파일 내용을 가져오는 중 오류가 발생했습니다: {str(e)}"