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
        tree_items = git_tree.tree
    except Exception as e:
        raise Exception(f"레포지토리 트리를 가져오는 중 오류가 발생했습니다: {str(e)}")
    
    # 경로 목록 생성
    paths = []
    for item in tree_items:
        # max_depth 제한 확인
        if max_depth > 0 and item.path.count('/') >= max_depth:
            continue
        paths.append(item.path)
    
    # 경로 정렬
    sorted_paths = sorted(paths)
    
    return full_repo, branch, sorted_paths

def format_tree(paths):
    """경로 목록을 시각적 트리 구조로 변환합니다."""
    if not paths:
        return []
    
    # 트리 노드 구성
    tree = {}
    for path in paths:
        parts = path.split('/')
        current = tree
        for i, part in enumerate(parts):
            if i == len(parts) - 1:  # 마지막 부분(파일 또는 디렉토리)
                current.setdefault(part, {})
            else:
                if part not in current:
                    current[part] = {}
                current = current[part]
    
    # 트리 시각화
    lines = []
    _format_tree_node(tree, "", "", lines)
    return lines

def _format_tree_node(node, prefix, name, lines):
    """트리 노드를 재귀적으로 처리하여 시각적 표현을 생성합니다."""
    if name:
        lines.append(f"{prefix}{name}")
    
    items = list(sorted(node.items()))
    for i, (key, value) in enumerate(items):
        is_last = i == len(items) - 1
        new_prefix = prefix + ("└─ " if is_last else "├─ ")
        next_prefix = prefix + ("   " if is_last else "│  ")
        
        # 디렉토리와 파일을 구분하지 않고 동일한 형식으로 표시
        lines.append(f"{new_prefix}{key}")
        if value:  # 하위 항목이 있는 경우
            _format_tree_node(value, next_prefix, "", lines)