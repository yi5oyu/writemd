from github import Github
from typing import List, Tuple, Dict, Any, Optional

def create_github_client(access_token: str) -> Github:
    """
    GitHub API 클라이언트를 생성합니다.
    
    Args:
        access_token (str): GitHub 접근 토큰
        
    Returns:
        Github: GitHub API 클라이언트 객체
        
    Raises:
        ValueError: 유효하지 않은 접근 토큰일 경우
    """
    if not access_token or access_token.strip() == "":
        raise ValueError("GitHub 접근 토큰이 필요합니다.")
    
    return Github(access_token)
    
def get_repository_tree(
    github_client: Github, 
    owner: str, 
    repo: str, 
    branch: str = "", 
    max_depth: int = 0
) -> Tuple[str, str, List[str]]:
    """
    GitHub 레포지토리의 트리 데이터를 가져옵니다.
    
    Args:
        github_client (Github): GitHub API 클라이언트
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        Tuple[str, str, List[str]]: (full_repo, branch, paths) 형태의 튜플
        
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    full_repo, branch, git_tree = _get_repository_git_tree(github_client, owner, repo, branch)
    paths = _extract_paths_from_tree(git_tree.tree, max_depth)
    return full_repo, branch, paths

def get_repository_tree_with_metadata(
    github_client: Github, 
    owner: str, 
    repo: str, 
    branch: str = "", 
    max_depth: int = 0
) -> Tuple[str, str, List[Dict[str, Any]]]:
    """
    GitHub 레포지토리의 트리 데이터와 메타데이터를 가져옵니다.
    
    Args:
        github_client (Github): GitHub API 클라이언트
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        Tuple[str, str, List[Dict[str, Any]]]: (full_repo, branch, items) 형태의 튜플
                                              items는 각 항목의 경로, sha, 타입을 포함한 사전 목록
        
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    full_repo, branch, git_tree = _get_repository_git_tree(github_client, owner, repo, branch)
    items = _extract_items_with_metadata_from_tree(git_tree.tree, max_depth)
    return full_repo, branch, items

def _get_repository_git_tree(
    github_client: Github, 
    owner: str, 
    repo: str, 
    branch: str = ""
) -> Tuple[str, str, Any]:
    """
    GitHub 레포지토리의 Git 트리를 가져옵니다.
    
    Args:
        github_client (Github): GitHub API 클라이언트
        owner (str): 레포지토리 소유자
        repo (str): 레포지토리 이름
        branch (str, optional): 브랜치 이름 (기본값: 레포지토리 기본 브랜치)
        
    Returns:
        Tuple[str, str, Any]: (full_repo, branch, git_tree) 형태의 튜플
        
    Raises:
        Exception: 레포지토리, 브랜치 또는 트리를 가져오는 중 오류 발생 시
    """
    # 레포지토리 형식 처리
    full_repo = repo
    if "/" in repo:
        parts = repo.split('/')
        if len(parts) == 2:
            owner, repo = parts
    
    full_repo = f"{owner}/{repo}"
    
    # 레포지토리 가져오기
    try:
        repository = github_client.get_repo(full_repo)
    except Exception as e:
        raise Exception(f"레포지토리를 찾을 수 없습니다: {str(e)}")
    
    # 브랜치 처리
    if not branch or branch.strip() == "":
        branch = repository.default_branch
    
    try:
        branch_obj = repository.get_branch(branch)
        commit_sha = branch_obj.commit.sha
    except Exception as e:
        raise Exception(f"브랜치를 찾을 수 없습니다: {str(e)}")
    
    # Git 트리 가져오기
    try:
        git_tree = repository.get_git_tree(commit_sha, recursive=True)
    except Exception as e:
        raise Exception(f"레포지토리 트리를 가져오는 중 오류가 발생했습니다: {str(e)}")
    
    return full_repo, branch, git_tree

def _extract_paths_from_tree(tree_items: List[Any], max_depth: int = 0) -> List[str]:
    """
    트리 아이템에서 경로만 추출합니다.
    
    Args:
        tree_items (List[Any]): GitHub 트리 아이템 목록
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        List[str]: 정렬된 경로 목록
    """
    paths = []
    for item in tree_items:
        # max_depth 제한 확인
        if max_depth > 0 and item.path.count('/') >= max_depth:
            continue
        paths.append(item.path)
    
    # 경로 정렬
    return sorted(paths)

def _extract_items_with_metadata_from_tree(tree_items: List[Any], max_depth: int = 0) -> List[Dict[str, Any]]:
    """
    트리 아이템에서 경로, SHA, 타입 등의 메타데이터를 추출합니다.
    
    Args:
        tree_items (List[Any]): GitHub 트리 아이템 목록
        max_depth (int, optional): 최대 깊이 (0=제한 없음)
        
    Returns:
        List[Dict[str, Any]]: 정렬된 아이템 목록 (각 아이템은 경로, SHA, 타입 포함)
    """
    items = []
    for item in tree_items:
        # max_depth 제한 확인
        if max_depth > 0 and item.path.count('/') >= max_depth:
            continue
        
        items.append({
            "path": item.path,
            "sha": item.sha,
            "type": item.type
        })
    
    # 경로 기준으로 정렬
    return sorted(items, key=lambda x: x["path"])