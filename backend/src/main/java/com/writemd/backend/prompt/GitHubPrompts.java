package com.writemd.backend.prompt;

import org.springframework.stereotype.Component;

@Component
public class GitHubPrompts {

    // 레포지토리 구조 분석 프롬프트 생성
    public String createRepoStructurePrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리의 폴더 구조 분석\n" +
                "파일 내용은 분석하지 말고 파일과 디렉토리의 계층 구조를 트리 형태로 보여줘.\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n"+
                "매우 중요한 지침:\n" +
                "1. 전체 폴더 구조를 도구로 가져와 프로젝트의 핵심만 담은 간략한 구조로 변환.\n" +
                "2. 루트 디렉토리와 루트 디렉토리 내의 모든 폴더/파일은 필수로 포함.\n" +
                "3. 다음 파일들은 생략:\n" +
                "   - 중요하지 않은 설정 파일\n" +
                "   - 숨김 파일\n" +
                "4. 트리 구조는 최대 40줄 이내로 제한, 너무 많은 항목이 있을 경우 중요도에 따라 선택.\n" +
                "5. 구조 표시 규칙:\n" +
                "   - 모든 디렉토리는 항상 파일보다 먼저 나열\n" +
                "   - 같은 디렉토리 내에서 모든 하위 디렉토리를 먼저 표시한 후 파일을 표시\n" +
                "   - 디렉토리 이름 뒤에는 반드시 '/' 표시를 붙일 것\n" +
                "   - 디렉토리끼리, 파일끼리 알파벳 순으로 정렬\n" +
                "6. 어떤 설명, 소개, 결론도 추가없이 오직 구조만 보여주고, 다음 형식으로 응답:\\n\\n```\\n[폴더 구조]\\n```..",
            owner, repo, branch, token
        );
    }

    // 레포지토리 전체 분석 프롬프트 생성
    public String createRepoBasicInfoPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 기본 정보 및 주요 특징 간략 분석:\n" +
                "- 레포지토리 목적\n" +
                "- 주요 프로그래밍 언어\n" +
                "- 핵심 기능\n" +
                "- 주요 특징\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: 간결하게 분석하고 토큰 사용량을 최소화할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    public String createRepoTechStackPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 기술 스택 간략 분석:\n" +
                "- 주요 프레임워크/라이브러리\n" +
                "- 데이터베이스 시스템\n" +
                "- 빌드 도구\n" +
                "- 전체 아키텍처 패턴\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: package.json/pom.xml/requirements.txt 등의 파일만 집중적으로 확인하고 간결하게 요약할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    public String createRepoCodeStructurePrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 코드 구조 간략 분석:\n" +
                "- 주요 디렉토리 구조 (3단계 깊이까지만)\n" +
                "- 핵심 파일 3-5개 및 용도\n" +
                "- 주요 코드 흐름\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: 최소한의 필수 정보만 포함하고 코드 인용은 피할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    public String createRepoConfigQualityPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 설정 및 품질 간략 분석:\n" +
                "- 주요 설정 파일\n" +
                "- 환경 설정 방식\n" +
                "- 테스트 접근법\n" +
                "- 코드 스타일\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: .env, Dockerfile, docker-compose.yml, tests/ 폴더 등 핵심 파일만 확인할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    public String createRepoSecurityWorkflowPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 보안 및 워크플로우 간략 분석:\n" +
                "- 보안 관련 구현\n" +
                "- CI/CD 설정\n" +
                "- 배포 워크플로우\n" +
                "- 확장성 접근법\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: .github/ 폴더, CI 설정 파일 및 배포 스크립트만 집중 분석할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    public String createRepoConclusionPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 결론 요약:\n" +
                "- 주요 강점 2-3개\n" +
                "- 개선 가능 영역 2-3개\n" +
                "- 전체 품질 평가\n\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>\n\n" +
                "중요: 매우 간결하게 종합하고, 핵심 인사이트만 포함할 것.",
            owner, repo, owner, repo, branch, token
        );
    }

    // 단일 파일 분석 프롬프트 생성
    public String createDocumentAnalysisPrompt(String content) {
        return String.format(
            "다음 문서를 분석하고 맞춤법, 문법, 내용에 대한 상세한 조언을 제공해줘.\n\n" +
                "다음 항목별로 분석:\n" +
                "1. 맞춤법 및 문법 오류: 발견된 모든 맞춤법과 문법 오류를 지적하고 올바른 표현을 제안.\n" +
                "2. 문장 구조 개선: 어색하거나 명확하지 않은 문장을 찾아 더 자연스럽고 명확한 표현으로 개선.\n" +
                "3. 내용 구성 및 논리성: 내용의 구성과 논리적 흐름을 평가하고 개선점을 제안.\n" +
                "4. 용어 사용 적절성: 부적절하거나 일관성 없는 용어 사용을 찾아 개선안을 제시.\n" +
                "5. 문서 전체 품질 평가: 전체적인 문서의 품질을 평가하고 종합적인 개선 방향을 제안.\n\n" +
                "각 항목별로 구체적인 예시와 함께 개선안을 제시, 발견된 문제점과 그에 대한 해결책을 명확히 구분해줘.\n\n" +
                "<document>\n%s\n</document>",
            content
        );
    }

}
