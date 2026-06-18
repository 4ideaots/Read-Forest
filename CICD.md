# CI/CD 가이드 (GitHub Actions → GHCR → EC2)

```
PR        ──► CI (백엔드 테스트 + 프론트 빌드)
main 머지 ──► Deploy: 테스트 ─► 이미지 빌드/푸시(GHCR) ─► EC2 에서 pull & 재기동
```

빌드는 GitHub 러너에서 수행하고, EC2 는 **이미지를 pull 만** 합니다(작은 인스턴스에서 빌드 부담 제거).

## 워크플로
| 파일 | 트리거 | 역할 |
|---|---|---|
| `.github/workflows/ci.yml` | PR / main 외 푸시 | `./gradlew test`, `npm run build` 검증 |
| `.github/workflows/deploy.yml` | main 푸시 / 수동 | 테스트 → GHCR 이미지 빌드·푸시 → EC2 SSH 배포 |
| `docker-compose.prod.yml` | (서버에서 사용) | 서비스 이미지를 GHCR 경로로 오버라이드 |

## 1회 설정

### A. GitHub 리포 Secrets 등록
**Settings → Secrets and variables → Actions → New repository secret**

| Secret | 값 |
|---|---|
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 (예: `readforest.p-e.kr`) |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | EC2 접속용 **개인키 전체 내용**(.pem 파일 내용) |
| `EC2_SSH_PORT` | (선택) 기본 22 |

> `GITHUB_TOKEN` 은 자동 제공되며 GHCR 푸시/풀에 사용됩니다. 별도 등록 불필요.

### B. EC2 사전 상태 (이미 충족되어 있으면 생략)
- `~/Read-Forest` 에 리포가 clone 되어 있고 `.env` 가 채워져 있을 것
- `ec2-user` 가 `docker` 그룹에 속해 sudo 없이 `docker` 사용 가능할 것

### C. GHCR 패키지 권한
첫 배포 후 `ghcr.io/4ideaots/readforest-backend`, `...-nginx` 패키지가 생성됩니다.
EC2 의 pull 이 권한 오류로 실패하면 둘 중 하나로 해결:
- 패키지를 **public** 으로 전환: GitHub → 프로필/Org → Packages → 각 패키지 → Package settings → Change visibility, 또는
- 패키지 settings 의 **Manage Actions access** 에서 이 리포에 read 권한 부여

## 배포 방법
- **자동**: `main` 에 머지하면 자동 실행.
- **수동**: Actions 탭 → Deploy → Run workflow.

## 롤백
이미지는 `:latest` 와 `:<git-sha>` 두 태그로 푸시됩니다. 특정 커밋으로 되돌리려면 EC2 에서:
```bash
cd ~/Read-Forest
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  pull && docker tag ghcr.io/4ideaots/readforest-backend:<sha> ghcr.io/4ideaots/readforest-backend:latest
# 또는 docker-compose.prod.yml 의 태그를 <sha> 로 바꿔 up -d
```

## 주의
- 최초 1회 HTTPS 인증서는 여전히 `./init-letsencrypt.sh` 로 발급해야 합니다(배포 파이프라인과 별개, 1회성).
- `deploy.yml` 은 서버에서 `git reset --hard origin/main` 을 수행합니다. 추적 파일은 origin 기준으로 덮어쓰며, `.env`·`certbot/` 는 gitignore 라 보존됩니다.
