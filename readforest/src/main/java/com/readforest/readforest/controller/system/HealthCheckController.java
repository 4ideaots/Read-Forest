package com.readforest.readforest.controller.system;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 서버 상태 확인 컨트롤러.
 *
 * <p>로드밸런서 타겟 그룹 헬스 체크용으로 사용되며,
 * 서버의 정상 동작 여부를 확인하는 엔드포인트를 제공합니다.</p>
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCheckController {

    /**
     * 서버 상태를 확인합니다.
     *
     * <p>항상 200 OK와 함께 {@code {"status": "UP"}} 응답을 반환합니다.
     * 로드밸런서의 헬스 체크 요청에 응답하기 위해 사용됩니다.</p>
     *
     * @return 서버 상태 정보를 포함한 응답
     */
    @GetMapping
    public ResponseEntity<?> healthCheck() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
