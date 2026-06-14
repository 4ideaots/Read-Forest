package com.readforest.readforest.config;

import com.readforest.readforest.domain.Book;
import com.readforest.readforest.domain.InventoryItem;
import com.readforest.readforest.domain.Item;
import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.BookRepository;
import com.readforest.readforest.repository.InventoryItemRepository;
import com.readforest.readforest.repository.ItemRepository;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataInit implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ItemRepository itemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final com.readforest.readforest.service.DecorationCatalogService decorationCatalogService;
    private final com.readforest.readforest.service.QuestService questService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing test data...");

        // 1. Create a test user if repository is empty
        User user;
        if (userRepository.count() == 0) {
            user = userRepository.save(User.builder()
                    .username("testuser")
                    .password("seed-user-no-login")
                    .nickname("초록정원사")
                    .profileImageUrl("https://s3.readforest.com/profile.png")
                    .role("ROLE_USER")
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info("Initialized test User ID: {}", user.getId());
        } else {
            user = userRepository.findAll().get(0);
        }

        // 2. Create a test book if repository is empty
        Book book;
        if (bookRepository.count() == 0) {
            book = bookRepository.save(Book.builder()
                    .title("자바의 정석")
                    .author("남궁성")
                    .genre("IT/컴퓨터")
                    .totalPage(1000)
                    .coverImageUrl("https://s3.readforest.com/java_cover.png")
                    .isbn("9788994492032")
                    .build());
            log.info("Initialized test Book ID: {}", book.getId());
        } else {
            book = bookRepository.findAll().get(0);
        }

        // 3. Create a test item if repository is empty
        Item squirrel;
        if (itemRepository.count() == 0) {
            squirrel = itemRepository.save(Item.builder()
                    .name("귀여운 다람쥐")
                    .type(Item.ItemType.ANIMAL)
                    .imageUrl("https://s3.readforest.com/items/squirrel.png")
                    .description("나무 사이를 뛰어노는 활기찬 다람쥐입니다.")
                    .build());
            log.info("Initialized test Item ID: {}", squirrel.getId());
        } else {
            squirrel = itemRepository.findAll().get(0);
        }

        // 4. Give the item to the user if not exists
        boolean ownsItem = inventoryItemRepository.existsByUserIdAndItemId(user.getId(), squirrel.getId());
        if (!ownsItem) {
            inventoryItemRepository.save(InventoryItem.builder()
                    .user(user)
                    .item(squirrel)
                    .acquiredAt(LocalDateTime.now())
                    .build());
            log.info("Added Item to User Inventory");
        }

        // 5. Seed the 13-piece decoration catalog and grant it to every user so
        //    relational decoration placement (PUT /api/forests/me/decorations) works.
        decorationCatalogService.seedItems();
        userRepository.findAll().forEach(decorationCatalogService::grantAllToUser);
        log.info("Seeded decoration catalog and granted items to all users.");

        // 6. Seed the daily/weekly quest templates (backend-authoritative quests).
        questService.seedQuests();
        log.info("Seeded quest templates.");

        log.info("Test data initialization completed successfully.");
    }
}
