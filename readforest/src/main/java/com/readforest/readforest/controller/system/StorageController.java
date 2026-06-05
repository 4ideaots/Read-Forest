package com.readforest.readforest.controller.system;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * 파일 처리 컨트롤러.
 *
 * <p>AWS S3 이미지 업로드 전용 컨트롤러로,
 * 클라이언트로부터 파일을 받아 S3에 업로드하고
 * presigned URL을 반환하는 엔드포인트를 제공합니다.</p>
 */
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    /**
     * 파일을 업로드합니다.
     *
     * <p>클라이언트로부터 전달받은 파일을 AWS S3에 업로드하고,
     * 해당 파일에 접근할 수 있는 presigned URL을 반환합니다.</p>
     *
     * @param file 업로드할 파일 (multipart/form-data)
     * @return S3 presigned URL을 포함한 응답
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("url", "https://s3.example.com/placeholder"));
    }
}
