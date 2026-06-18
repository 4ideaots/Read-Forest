# Docker 배포 가이드 (Nginx + Spring Boot + Certbot)

EC2 한 대에 컨테이너로 올립니다. DB 는 외부 **AWS RDS(MySQL)** 를 사용합니다.

```
[브라우저] ─https─> nginx 컨테이너(80/443) ─┬─ /            정적 프론트(빌드 내장)
                                            └─ /api,/oauth2 backend 컨테이너(8080) ─> RDS
                          ▲
                  certbot 컨테이너가 인증서 발급/자동갱신
```

## 구성 파일
| 파일 | 역할 |
|---|---|
| `docker-compose.yml` | backend / nginx / certbot 3개 서비스 |
| `readforest/Dockerfile` | Gradle 빌드 → JRE 21 실행 (멀티스테이지) |
| `nginx/Dockerfile` | 프론트엔드 빌드 → nginx 정적 서빙 |
| `nginx/templates/default.conf.template` | `${DOMAIN}` 치환되는 nginx 설정 |
| `init-letsencrypt.sh` | 최초 인증서 발급 부트스트랩 |
| `.env.docker.example` | compose 환경변수 템플릿 |

## 사전 준비
1. **도메인 필수** — Let's Encrypt 는 IP 로는 발급 불가. 도메인 **A 레코드**가 EC2 퍼블릭 IP 를 가리키게 설정.
2. EC2 **보안 그룹**: 80, 443 인바운드 허용 (8080 은 열 필요 없음).
3. RDS **보안 그룹**: 3306 을 EC2 보안 그룹에서만 허용.
4. EC2 에 Docker 설치:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker $USER && newgrp docker
   ```

## 배포 절차
```bash
git clone <레포> Read-Forest && cd Read-Forest

# 1) 환경변수 작성
cp .env.docker.example .env
nano .env            # DOMAIN, CERTBOT_EMAIL, RDS 정보, KAKAO_API_KEY, JWT_SECRET 등
#  - 처음엔 CERTBOT_STAGING=1 로 테스트 후, 성공하면 0 으로 바꿔 재발급 권장
#  - JWT_SECRET 생성:  openssl rand -base64 48

# 2) 이미지 빌드 (프론트/백엔드 모두 컨테이너 안에서 빌드됨)
docker compose build

# 3) 최초 인증서 발급 (nginx 도 함께 기동됨)
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh

# 4) 전체 기동
docker compose up -d

# 상태/로그
docker compose ps
docker compose logs -f backend
```
→ 브라우저에서 `https://<도메인>` 접속.

> staging(1)으로 먼저 받았다면, `.env` 에서 `CERTBOT_STAGING=0` 으로 바꾼 뒤
> `./init-letsencrypt.sh` 를 다시 실행해 신뢰되는 실 인증서로 교체하세요.

## 인증서 자동 갱신
`certbot` 컨테이너가 12시간마다 `certbot renew` 를 돌리고(만료 30일 이내일 때만 실제 갱신),
`nginx` 컨테이너가 6시간마다 `nginx -s reload` 로 갱신본을 반영합니다. **별도 cron 불필요.**

## 코드 업데이트 후 재배포
```bash
git pull
docker compose up -d --build      # 변경된 이미지만 다시 빌드 후 무중단에 가깝게 교체
```

## OAuth2 주의
- nginx 가 `X-Forwarded-Proto` 를 전달하고 Spring 의 `server.forward-headers-strategy=native`
  설정 덕분에 콜백 URL 이 `https://<도메인>/...` 으로 생성됩니다.
- 카카오/깃허브 개발자 콘솔의 **Redirect URI** 를
  `https://<도메인>/login/oauth2/code/kakao`, `.../github` 로 등록하세요.

## 트러블슈팅
- **nginx 가 안 뜸 / 인증서 경로 에러** → `init-letsencrypt.sh` 를 먼저 실행했는지 확인.
- **502 Bad Gateway** → `docker compose logs backend` 로 RDS 연결/기동 확인 (DB 보안그룹·계정).
- **챌린지 실패(빌드는 됨)** → 도메인 A 레코드가 실제 EC2 IP 인지, 80 포트가 열렸는지 확인.
- **rate limit** → 실 인증서 발급 실패 반복 시 `CERTBOT_STAGING=1` 로 테스트.
