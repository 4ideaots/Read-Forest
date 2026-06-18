#!/bin/bash
# Read-Forest: Let's Encrypt 첫 인증서 발급 부트스트랩.
# 도메인의 A 레코드가 이 서버 IP 를 가리킨 뒤 1회 실행하세요.
#   chmod +x init-letsencrypt.sh && sudo ./init-letsencrypt.sh
set -e

# .env 에서 DOMAIN / CERTBOT_EMAIL 읽기
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi

domain="${DOMAIN:?DOMAIN 을 .env 에 설정하세요}"
email="${CERTBOT_EMAIL:?CERTBOT_EMAIL 을 .env 에 설정하세요}"
staging="${CERTBOT_STAGING:-0}"   # 1 이면 staging(테스트)으로 발급 → rate limit 회피

data_path="./certbot"
rsa_key_size=4096

if ! command -v docker >/dev/null 2>&1; then
  echo "docker 가 설치되어 있지 않습니다." >&2; exit 1
fi
compose() { docker compose "$@"; }

# 권장 TLS 파라미터 내려받기 (nginx 가 include 함)
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### 권장 TLS 파라미터 다운로드 ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
fi

live_path="/etc/letsencrypt/live/$domain"

echo "### $domain 용 더미 인증서 생성 ..."
mkdir -p "$data_path/conf/live/$domain"
compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout '$live_path/privkey.pem' \
    -out '$live_path/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### nginx 기동 (더미 인증서로) ..."
compose up -d nginx

echo "### 더미 인증서 삭제 ..."
compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domain && \
  rm -Rf /etc/letsencrypt/archive/$domain && \
  rm -Rf /etc/letsencrypt/renewal/$domain.conf" certbot

echo "### Let's Encrypt 실 인증서 요청 ..."
staging_arg=""
if [ "$staging" != "0" ]; then staging_arg="--staging"; fi

compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    -d $domain \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "### nginx reload ..."
compose exec nginx nginx -s reload

echo "### 완료. https://$domain 접속 확인하세요."
