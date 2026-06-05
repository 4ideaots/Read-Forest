package com.readforest.readforest.controller.system;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 서버 상태 확인 컨트롤러.
 *
 * <p>내부 데이터베이스 연결 유효성을 점검합니다.</p>
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 서버 상태를 확인합니다.
     *
     * <p>서버 런타임 상태와 데이터베이스(MySQL) 연결 상태를 실시간으로 확인하여 응답합니다.
     * DB 조회 실패 시 503 Service Unavailable을 반환합니다.</p>
     *
     * @return 서버 및 DB 상태 정보를 포함한 응답
     */
    @GetMapping
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("status", "UP");

        try {
            // MySQL 데이터베이스 연결 상태 검증 (단순 쿼리 실행)
            jdbcTemplate.execute("SELECT 1");
            statusMap.put("database", "UP");
            return ResponseEntity.ok(statusMap);
        } catch (Exception e) {
            statusMap.put("status", "DOWN");
            statusMap.put("database", "DOWN");
            statusMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(statusMap);
        }
    }
}
