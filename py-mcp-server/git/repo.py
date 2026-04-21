from githubkit import GitHub
from typing import List, Tuple, Dict, Any

def create_github_client(access_token: str) -> GitHub:
    """
    GitHub API 비동기 클라이언트를 생성합니다.
    
    Args:
        access_token (str): GitHub 접근 토큰
        
    Returns:
        GitHub: githubkit API 클라이언트 객체
        
    Raises:
        ValueError: 유효하지 않은 접근 토큰일 경우
    """
    if not access_token or access_token.strip() == "":
        raise ValueError("GitHub 접근 토큰이 필요합니다.")
    
    return GitHub(access_token)
    
async def get_repository_tree(
    github_client: GitHub, 
    owner: str, 
    repo: str, 
    branch: str = "", 
    max_depth: int = 0
) -> Tuple[str, str, List[str]]:
    """
    GitHub 레포지토리의 트리 데이터를 가져옵니다.
    
    Args:
        github_client (GitHub): githubkit API 클라이언트 객체
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        Tuple[str, str, List[str]]: (full_repo, branch, paths) 형태의 튜플
        
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    # 비동기 함수의 응답 논블로킹
    full_repo, branch, tree_items = await _get_repository_git_tree(github_client, owner, repo, branch)
    
    paths = _extract_paths_from_tree(tree_items, max_depth)
    
    return full_repo, branch, paths

async def get_repository_tree_with_metadata(
    github_client: GitHub, 
    owner: str, 
    repo: str, 
    branch: str = "", 
    max_depth: int = 0
) -> Tuple[str, str, List[Dict[str, Any]]]:
    """
    GitHub 레포지토리의 트리 데이터와 메타데이터를 가져옵니다.
    
    Args:
        github_client (GitHub): githubkit API 클라이언트 객체
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        Tuple[str, str, List[Dict[str, Any]]]: (full_repo, branch, items) 형태의 튜플
            items는 각 항목의 경로(path), sha, 타입(type)을 포함한 사전(Dict) 목록
            
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    full_repo, branch, tree_items = await _get_repository_git_tree(github_client, owner, repo, branch)
    
    items = _extract_items_with_metadata_from_tree(tree_items, max_depth)
    
    return full_repo, branch, items

async def _get_repository_git_tree(
    github_client: GitHub, 
    owner: str, 
    repo: str, 
    branch: str = ""
) -> Tuple[str, str, Any]:
    """
    GitHub API를 호출하여 Git 트리를 가져옵니다.
    
    Args:
        github_client (GitHub): githubkit API 클라이언트 객체
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        
    Returns:
        Tuple[str, str, Any]: (full_repo, branch, tree_items) 형태의 튜플
            tree_items는 GitHub 트리 아이템들의 리스트입니다.
            
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    # 레포지토리 형식 (owner/repo)
    full_repo = repo
    if "/" in repo:
        parts = repo.split('/')
        if len(parts) == 2:
            owner, repo = parts
    
    full_repo = f"{owner}/{repo}"
    
    # 레포지토리 정보 가져오기
    try:
        repo_response = await github_client.rest.repos.async_get(owner, repo)
        repository = repo_response.parsed_data
    except Exception as e:
        raise Exception(f"레포지토리를 찾을 수 없습니다: {str(e)}")
    
    # 브랜치 처리: 입력값 없으면 기본 브랜치(main/master) 사용
    if not branch or branch.strip() == "":
        branch = repository.default_branch
    
    # 브랜치 객체/최신 커밋 SHA 가져오기
    try:
        branch_response = await github_client.rest.repos.async_get_branch(owner, repo, branch)
        branch_obj = branch_response.parsed_data
        commit_sha = branch_obj.commit.sha
    except Exception as e:
        raise Exception(f"브랜치를 찾을 수 없습니다: {str(e)}")
    
    # Git 트리 가져오기
    try:
        tree_response = await github_client.rest.git.async_get_tree(owner, repo, commit_sha, recursive="1")
        git_tree_items = tree_response.parsed_data.tree
    except Exception as e:
        raise Exception(f"레포지토리 트리를 가져오는 중 오류가 발생했습니다: {str(e)}")
    
    return full_repo, branch, git_tree_items

def _extract_paths_from_tree(tree_items: List[Any], max_depth: int = 0) -> List[str]:
    """
    트리 아이템 목록에서 경로 문자열만 추출하여 정렬된 리스트로 반환합니다.
    
    Args:
        tree_items (List[Any]): GitHub API로부터 받은 트리 아이템 객체 리스트
        max_depth (int, optional): 추출할 폴더의 최대 깊이 (0은 제한 없음)
        
    Returns:
        List[str]: 알파벳 순으로 정렬된 경로 리스트
    """
    paths = []
    for item in tree_items:
        path = getattr(item, "path", "")
        
        if not path:
            continue

        if max_depth > 0 and path.count('/') >= max_depth:
            continue
            
        paths.append(path)
    
    return sorted(paths)

def _extract_items_with_metadata_from_tree(tree_items: List[Any], max_depth: int = 0) -> List[Dict[str, Any]]:
    """
    트리 아이템 객체 목록에서 경로, SHA, 타입 등 필수 메타데이터만 추출하여 반환합니다.
    
    Args:
        tree_items (List[Any]): GitHub API로부터 받은 트리 아이템 리스트
        max_depth (int, optional): 추출할 최대 깊이 (0은 제한 없음)
        
    Returns:
        List[Dict[str, Any]]: 경로(path) 기준으로 정렬된 메타데이터 사전 리스트
    """
    items = []
    for item in tree_items:
        path = getattr(item, "path", "")
        if not path:
            continue
            
        if max_depth > 0 and path.count('/') >= max_depth:
            continue
        
        # 필요 정보만 추출
        items.append({
            "path": path,
            "sha": getattr(item, "sha", "unknown"),
            "type": getattr(item, "type", "unknown")
        })
    
    return sorted(items, key=lambda x: x["path"])