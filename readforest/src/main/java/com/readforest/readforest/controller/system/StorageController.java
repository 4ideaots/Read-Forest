package com.readforest.readforest.controller.system;

import com.readforest.readforest.entity.FileEntity;
import com.readforest.readforest.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * 파일 처리 컨트롤러.
 *
 * <p>H2 데이터베이스를 활용한 이미지 및 파일 업로드/다운로드 컨트롤러입니다.</p>
 */
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    private final FileRepository fileRepository;

    /**
     * 파일을 업로드합니다.
     *
     * <p>클라이언트로부터 전달받은 파일을 H2 데이터베이스에 BLOB 형태로 저장하고,
     * 해당 파일에 접근할 수 있는 다운로드 URL을 반환합니다.</p>
     *
     * @param file 업로드할 파일 (multipart/form-data)
     * @return 저장된 파일 정보 및 다운로드 URL
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일이 비어있습니다."));
        }
        try {
            FileEntity fileEntity = new FileEntity(
                file.getOriginalFilename(),
                file.getContentType(),
                file.getBytes()
            );
            FileEntity savedFile = fileRepository.save(fileEntity);
            
            String downloadUrl = "/api/storage/files/" + savedFile.getId();

            return ResponseEntity.ok(Map.of(
                "id", savedFile.getId(),
                "fileName", savedFile.getFileName(),
                "url", downloadUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }

    /**
     * 파일을 조회/다운로드합니다.
     *
     * <p>파일 ID를 기반으로 H2 데이터베이스에서 파일 데이터를 조회하여 반환합니다.</p>
     *
     * @param id 파일 ID
     * @return 파일 데이터 바이트 배열
     */
    @GetMapping("/files/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
        return fileRepository.findById(id)
            .map(file -> ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getData()))
            .orElse(ResponseEntity.notFound().build());
    }
}
