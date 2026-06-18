package com.readforest.readforest;

import com.readforest.readforest.domain.*;
import com.readforest.readforest.dto.DecorationRequestDto;
import com.readforest.readforest.dto.DecorationResponseDto;
import com.readforest.readforest.dto.ReadingRecordResponseDto;
import com.readforest.readforest.dto.TreeResponseDto;
import com.readforest.readforest.dto.TreeVitalityResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.*;
import com.readforest.readforest.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class TreeAndForestIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private TreeRepository treeRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private TreeService treeService;

    @Autowired
    private ReadingRecordService readingRecordService;

    @Autowired
    private TreeVitalityService treeVitalityService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ForestDecorationService forestDecorationService;

    private User testUser;
    private Book testBook;
    private Item squirrelItem;

    @BeforeEach
    public void setup() {
        // Clear or retrieve baseline values
        if (userRepository.count() == 0) {
            testUser = userRepository.save(User.builder()
                    .username("testuser")
                    .password("test-seed-no-login")
                    .role("ROLE_USER")
                    .nickname("가드너")
                    .createdAt(LocalDateTime.now())
                    .build());
        } else {
            testUser = userRepository.findAll().get(0);
        }

        if (bookRepository.count() == 0) {
            testBook = bookRepository.save(Book.builder()
                    .title("테스트책")
                    .author("저자")
                    .totalPage(500)
                    .build());
        } else {
            testBook = bookRepository.findAll().get(0);
        }

        // 카탈로그 시드(CatalogDataInit)가 Item 테이블을 채울 수 있으므로,
        // 인덱스가 아니라 이름으로 다람쥐 아이템을 find-or-create 한다.
        squirrelItem = itemRepository.findAll().stream()
                .filter(i -> "귀여운 다람쥐".equals(i.getName()))
                .findFirst()
                .orElseGet(() -> itemRepository.save(Item.builder()
                        .name("귀여운 다람쥐")
                        .type(Item.ItemType.ANIMAL)
                        .imageUrl("http://img.com")
                        .description("다람쥐")
                        .build()));

        // Add to inventory if missing
        boolean ownsItem = inventoryItemRepository.existsByUserIdAndItemId(testUser.getId(), squirrelItem.getId());
        if (!ownsItem) {
            inventoryItemRepository.save(InventoryItem.builder()
                    .user(testUser)
                    .item(squirrelItem)
                    .acquiredAt(LocalDateTime.now())
                    .build());
        }
    }

    @Test
    public void testPlantTree_Success() {
        // Act
        TreeResponseDto.Detail treeDetail = treeService.plantTree(testUser.getId(), testBook.getId());

        // Assert
        assertNotNull(treeDetail);
        assertNotNull(treeDetail.getId());
        assertEquals(testBook.getId(), treeDetail.getBookId());
        assertEquals(0, treeDetail.getCurrentPage());
        assertEquals(0.0, treeDetail.getGrowthRate());
        assertEquals("HEALTHY", treeDetail.getVitality());
        assertFalse(treeDetail.getIsCompleted());
    }

    @Test
    public void testGetTreeDetail_Success() {
        // Arrange
        Tree tree = treeRepository.save(Tree.builder()
                .user(testUser)
                .book(testBook)
                .currentPage(100)
                .growthRate(20.0)
                .vitality(Tree.Vitality.HEALTHY)
                .isCompleted(false)
                .build());

        // Act
        TreeResponseDto.Detail detail = treeService.getTreeDetail(tree.getId());

        // Assert
        assertNotNull(detail);
        assertEquals(tree.getId(), detail.getId());
        assertEquals(100, detail.getCurrentPage());
        assertEquals(20.0, detail.getGrowthRate());
    }

    @Test
    public void testAddReadingRecord_SuccessAndRecovery() {
        // Arrange (Start with WITHERED tree)
        Tree tree = treeRepository.save(Tree.builder()
                .user(testUser)
                .book(testBook)
                .currentPage(100)
                .growthRate(20.0)
                .vitality(Tree.Vitality.WITHERED)
                .isCompleted(false)
                .build());

        // Act
        ReadingRecordResponseDto.Detail recordDetail = readingRecordService.addRecord(tree.getId(), 250);

        // Assert
        assertNotNull(recordDetail);
        assertEquals(250, recordDetail.getCurrentPage());
        assertEquals(150, recordDetail.getReadPages());

        // Retrieve tree details and assert growth rate dynamically based on book total pages
        double expectedGrowthRate = (250.0 / testBook.getTotalPage()) * 100.0;

        TreeResponseDto.Detail treeDetail = treeService.getTreeDetail(tree.getId());
        assertEquals(250, treeDetail.getCurrentPage());
        assertEquals(expectedGrowthRate, treeDetail.getGrowthRate());
        assertEquals("HEALTHY", treeDetail.getVitality());
    }

    @Test
    public void testAddReadingRecord_ValidationFailureExceedsTotal() {
        // Arrange
        Tree tree = treeRepository.save(Tree.builder()
                .user(testUser)
                .book(testBook)
                .currentPage(100)
                .growthRate(20.0)
                .vitality(Tree.Vitality.HEALTHY)
                .isCompleted(false)
                .build());

        // Act & Assert (Attempt to log pages exceeding book totalPage)
        int invalidPage = testBook.getTotalPage() + 1;

        CustomException exception = assertThrows(CustomException.class, () -> {
            readingRecordService.addRecord(tree.getId(), invalidPage);
        });

        assertEquals(ErrorCode.INVALID_PAGE_NUMBER, exception.getErrorCode());
    }

    @Test
    public void testGetTreeVitality_Success() {
        // Arrange
        Tree tree = treeRepository.save(Tree.builder()
                .user(testUser)
                .book(testBook)
                .currentPage(100)
                .growthRate(20.0)
                .vitality(Tree.Vitality.HEALTHY)
                .isCompleted(false)
                .build());

        // Act
        TreeVitalityResponseDto vitalityDto = treeVitalityService.getTreeVitality(tree.getId());

        // Assert
        assertNotNull(vitalityDto);
        assertEquals(tree.getId(), vitalityDto.getTreeId());
        assertEquals("HEALTHY", vitalityDto.getVitality());
    }

    @Test
    public void testGetInventoryItems_Success() {
        var inventory = inventoryService.getUserInventory(testUser.getId());
        
        assertFalse(inventory.isEmpty());
        assertEquals("귀여운 다람쥐", inventory.get(0).getItemName());
    }

    @Test
    public void testUpdateDecorations_Success() {
        // Arrange
        DecorationRequestDto.Placement placement = new DecorationRequestDto.Placement();
        placement.setItemId(squirrelItem.getId()); // Owned item
        placement.setPositionX(10.5);
        placement.setPositionY(20.0);
        placement.setIsPlaced(true);

        DecorationRequestDto request = new DecorationRequestDto();
        request.setDecorations(List.of(placement));

        // Act
        DecorationResponseDto response = forestDecorationService.updateDecorations(testUser.getId(), request);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getDecorations().size());
        assertEquals(squirrelItem.getId(), response.getDecorations().get(0).getItemId());
        assertEquals(10.5, response.getDecorations().get(0).getPositionX());
        assertTrue(response.getDecorations().get(0).getIsPlaced());
    }

    @Test
    public void testUpdateDecorations_InsufficientItem() {
        // Arrange (Create an item NOT owned by the user)
        Item unownedItem = itemRepository.save(Item.builder()
                .name("미보유 세계수")
                .type(Item.ItemType.OBJECT)
                .imageUrl("http://img2.com")
                .build());

        DecorationRequestDto.Placement placement = new DecorationRequestDto.Placement();
        placement.setItemId(unownedItem.getId()); // Unowned item
        placement.setPositionX(10.5);
        placement.setPositionY(20.0);
        placement.setIsPlaced(true);

        DecorationRequestDto request = new DecorationRequestDto();
        request.setDecorations(List.of(placement));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class, () -> {
            forestDecorationService.updateDecorations(testUser.getId(), request);
        });

        assertEquals(ErrorCode.INSUFFICIENT_ITEM, exception.getErrorCode());
    }
}
