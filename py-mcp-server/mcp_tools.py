from github import Github
from mcp.server.fastmcp import FastMCP
from typing import List, Dict, Any

from git.repo import create_github_client, get_repository_tree, get_repository_tree_with_metadata

mcp = FastMCP("py-mcp-server")

@mcp.tool(description="GitHub 레포지토리의 폴더 구조를 보여줍니다.")
def githubRepoStructure(owner: str, repo: str, branch: str = "", max_depth: int = 0, access_token: str = "") -> str:
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
        # 1. GitHub 객체 생성
        github_client = create_github_client(access_token)
        
        # 2. 레포지토리 및 트리 데이터 가져오기
        full_repo, branch, paths = get_repository_tree(
            github_client, owner, repo, branch, max_depth
        )
        
        # 3. 경로 목록 출력 포맷팅
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
def githubRepoFiles(owner: str, repo: str, branch: str = "", max_depth: int = 0, access_token: str = "") -> str:
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
        # 1. GitHub 객체 생성
        github_client = create_github_client(access_token)
        
        # 2. 레포지토리 및 트리 데이터 가져오기 (메타데이터 포함)
        full_repo, branch, items = get_repository_tree_with_metadata(
            github_client, owner, repo, branch, max_depth
        )
        
        # 3. 결과 포맷팅
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
def githubFileContent(owner: str, repo: str, path: str, branch: str = "", access_token: str = "") -> str:
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
        # 1. GitHub 객체 생성
        github_client = create_github_client(access_token)
        
        # 레포지토리 형식 처리
        full_repo = repo
        if "/" in repo:
            parts = repo.split('/')
            if len(parts) == 2:
                owner, repo = parts
        
        full_repo = f"{owner}/{repo}"
        
        # 2. 레포지토리 가져오기
        try:
            repository = github_client.get_repo(full_repo)
        except Exception as e:
            raise Exception(f"레포지토리를 찾을 수 없습니다: {str(e)}")
        
        # 3. 브랜치 처리
        if not branch or branch.strip() == "":
            branch = repository.default_branch
        
        # 4. 파일 내용 가져오기
        try:
            file_content = repository.get_contents(path, ref=branch)
            if isinstance(file_content, list):
                raise Exception("디렉토리 경로가 지정되었습니다. 파일 경로를 지정해주세요.")
            
            # 파일 정보 및 내용 반환
            header = f"파일: {path} (브랜치: {branch})\n"
            header += f"SHA: {file_content.sha}\n"
            header += f"크기: {file_content.size} bytes\n"
            header += "=" * 40 + "\n\n"
            
            # 파일 내용 디코딩
            content = file_content.decoded_content.decode('utf-8')
            
            return header + content
            
        except Exception as e:
            raise Exception(f"파일 내용을 가져오는 중 오류가 발생했습니다: {str(e)}")
    
    except ValueError as e:
        # 인증 관련 오류
        return str(e)
    except Exception as e:
        # 기타 오류
        return f"GitHub 파일 내용을 가져오는 중 오류가 발생했습니다: {str(e)}"