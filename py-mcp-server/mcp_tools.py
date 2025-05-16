from github import Github
from mcp.server.fastmcp import FastMCP

from git.repo import create_github_client, get_repository_tree, format_tree

mcp = FastMCP("py-mcp-server")

@mcp.tool(description="GitHub 레포지토리의 폴더 구조를 보여줍니다.")
def githubRepoStructure(owner: str, repo: str, branch: str = "", max_depth: int = 0, access_token: str = "") -> str:
    """GitHub 레포지토리 구조를 트리 형식으로 반환합니다."""
    
    try:
        # 1. GitHub 객체 생성
        github_client = create_github_client(access_token)
        
        # 2. 레포지토리 및 트리 데이터 가져오기
        full_repo, branch, paths = get_repository_tree(
            github_client, owner, repo, branch, max_depth
        )
        
        # 3. 트리 출력 포맷팅
        result = [f"{full_repo} ({branch})"]
        result.extend(format_tree(paths))
        
        return "\n".join(result)
    
    except ValueError as e:
        # 인증 관련 오류
        return str(e)
    except Exception as e:
        # 기타 오류
        return f"GitHub 레포지토리 구조를 가져오는 중 오류가 발생했습니다: {str(e)}"