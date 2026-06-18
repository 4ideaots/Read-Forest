package com.readforest.readforest.config;

import com.readforest.readforest.repository.UserRepository;
import com.readforest.readforest.service.DecorationCatalogService;
import com.readforest.readforest.service.QuestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 운영에 실제로 필요한 기준 데이터(카탈로그/퀘스트 템플릿) 초기화기.
 *
 * <p>장식 카탈로그와 퀘스트 템플릿이 없으면 정상 기능이 동작하지 않으므로
 * 모든 프로파일에서 항상 실행한다. 시드 메서드는 멱등하게 동작한다고 가정한다.
 * 테스트용 더미 데이터(테스트 유저/책/아이템)는 {@link TestDataInit}(dev 전용)에서만 만든다.</p>
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class CatalogDataInit implements CommandLineRunner {

    private final DecorationCatalogService decorationCatalogService;
    private final QuestService questService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        decorationCatalogService.seedItems();
        userRepository.findAll().forEach(decorationCatalogService::grantAllToUser);
        questService.seedQuests();
        log.info("Catalog & quest templates seeded.");
    }
}
