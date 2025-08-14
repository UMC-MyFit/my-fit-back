# MyFit
<p align="center">
  <img width="488" height="638" alt="Image" src="https://github.com/user-attachments/assets/eaf0e9a2-3582-4754-8db7-941cbba7dadc" />
</p>

MyFit은 인스타그램 피드처럼 직관적이고 가벼운 UI를 활용하여 구인·구직 과정을 부담 없이 진행할 수 있는 매칭 플랫폼입니다.<br/>
스타트업, 창업팀, 프리랜서, 프로젝트 팀 등이 자유롭게 자기 PR을 하고, 관심 있는 인재와 네트워킹하거나 ‘커피챗’을 통해 대화를 시작할 수 있도록 지원합니다.

### 핵심 특징
- 카드형 프로필: 사진과 소개를 한 장의 카드로 만들어 나를 직관적으로 표현
- 인스타그램 스타일 피드: 스와이프로 손쉽게 인재 탐색
- 관심 기반 커피챗: 관심 있는 인재에게 메시지를 보내고 가볍게 대화 시작
- 네트워킹 기능: 나와 핏이 맞는 동료, 협업자를 쉽게 찾을 수 있는 구조

## 📌 기술 스택 (Backend)
### Server
- Node.js, Express.js
### Database
- MySQL
### ORM
- Prisma ORM
### Cache / In-Memory
- Redis
### Real-time
- Socket.IO
### NLP/토크나이저
- mecab-ya
### Cloud(AWS)
- EC2
- RDS
- S3
### CI/CD
- GitHub Actions
### Process / Monitoring
- PM2

## 📚브랜치 전략 (GitLab-flow 방식)
- main/master
  - feature에서 합쳐진 기능 통합 테스트용
  - 배포 전 단계의 기준 브랜치
- feature/*
  - 기능 단위 개발 브랜치
  - 완료 시 main/master로 PR -> 머지 후 브랜치 제거
- pre-production
  - 배포 전 QA/통합 테스트용
  - 테스트 통과 시 production과 main에 각각 PR
- production
  - 실제 배포용

## 💡프로젝트 구조
- 아키텍처: 모듈러 모놀리식 (Modular Monolith)
  - 기능(도메인)별 모듈을 분리하여 유지보수성·확장성 확보
  - 공통 레이어(에러 핸들러, 로깅, 인증, Prisma 등)는 공유
- 패턴: MVC (Model-View-Controller)
  - Routes: HTTP 엔드포인트 정의
  - Controllers: 요청/응답과 유효성 검증
  - Services: 비즈니스 로직, 외부 리소스/DB 접근 조율
  - Models: 쿼리(ORM)을 통해 DB 접근

## 🙋‍♂️팀원 정보
### 라트로/채민수(팀장)
### 🐣미뇽/이용민
<img width="360" height="200" alt="Image" src="https://github.com/user-attachments/assets/d18a8990-a017-41dc-83db-f757ad45a8ee" /><br>
- 생년월일: 2002/03/09
- 전공/학과
  - 광운대학교 컴퓨터정보공학부
  - 2-2 재학 중 (2022 ~ )
- 연락처
  - 전화번호: 010-7600-5440
  - 이메일: bacaren21@naver.com
  - Github: https://github.com/turegold
### 단비/이주아


## PR 규칙
1. 이슈 생성 -> feature 또는 bug 이슈
2. 새로운 브랜치 생성 후 작업
3. 작업 완료 후 PR 올리기
4. 리뷰 후, main 브랜치에 merge

## 코드 컨벤션
node.js(javascript)  
- 카멜 표기법
- 들여쓰기: tap
