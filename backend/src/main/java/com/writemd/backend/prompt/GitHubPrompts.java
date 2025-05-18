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
    public String createRepoAnalysisPrompt(String owner, String repo, String branch, String token) {
        return String.format(
            "GitHub 레포지토리 '%s/%s' 전체 분석 요청입니다.\n\n" +
                "1. 먼저 레포지토리의 기본 구조를 파악해주세요.\n" +
                "2. 주요 파일과 디렉토리의 역할과 기능을 분석해주세요.\n" +
                "3. 전체 아키텍처와 디자인 패턴을 파악해주세요.\n" +
                "4. 핵심 코드와 알고리즘을 식별하고 설명해주세요.\n" +
                "<owner>%s</owner>\n" +
                "<repository>%s</repository>\n" +
                "<branch>%s</branch>\n" +
                "<github_token>%s</github_token>",
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
