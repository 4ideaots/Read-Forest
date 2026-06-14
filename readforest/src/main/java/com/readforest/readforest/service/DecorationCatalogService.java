package com.readforest.readforest.service;

import com.readforest.readforest.domain.InventoryItem;
import com.readforest.readforest.domain.Item;
import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.InventoryItemRepository;
import com.readforest.readforest.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 소품 카탈로그 서비스.
 *
 * <p>프론트엔드의 13종 정원 소품을 {@link Item}으로 시드하고, 사용자에게 인벤토리로
 * 지급한다. 소품 배치({@code PUT /api/forests/me/decorations})는 인벤토리 소유를
 * 요구하므로, 가입 시 전 소품을 지급하여 관계형 배치 연동이 동작하도록 한다.
 * (정원의 골드 경제는 프론트엔드에서 별도로 운영된다.)</p>
 */
@Service
@RequiredArgsConstructor
public class DecorationCatalogService {

    private final ItemRepository itemRepository;
    private final InventoryItemRepository inventoryItemRepository;

    /** 프론트엔드 DecorationType과 1:1 대응하는 카탈로그 (name = 타입 키). */
    private static final List<Object[]> CATALOG = List.of(
            new Object[]{"lantern", Item.ItemType.LIGHT, "풍경 정원등"},
            new Object[]{"pond", Item.ItemType.OBJECT, "하늘 연못"},
            new Object[]{"bench", Item.ItemType.OBJECT, "휴식 벤치"},
            new Object[]{"deer", Item.ItemType.ANIMAL, "신비한 사슴"},
            new Object[]{"rabbit", Item.ItemType.ANIMAL, "정원 토끼"},
            new Object[]{"stone_path", Item.ItemType.OBJECT, "자갈 디딤돌"},
            new Object[]{"house", Item.ItemType.OBJECT, "농장 오두막"},
            new Object[]{"fence", Item.ItemType.OBJECT, "나무 울타리"},
            new Object[]{"flowerbed", Item.ItemType.OBJECT, "꽃밭"},
            new Object[]{"mushroom", Item.ItemType.OBJECT, "버섯 무리"},
            new Object[]{"signpost", Item.ItemType.OBJECT, "나무 표지판"},
            new Object[]{"well", Item.ItemType.OBJECT, "돌 우물"},
            new Object[]{"scarecrow", Item.ItemType.OBJECT, "허수아비"}
    );

    /** 카탈로그 소품을 Item 테이블에 시드한다(이미 있으면 건너뜀). */
    @Transactional
    public void seedItems() {
        for (Object[] entry : CATALOG) {
            String name = (String) entry[0];
            if (itemRepository.findByName(name).isEmpty()) {
                itemRepository.save(Item.builder()
                        .name(name)
                        .type((Item.ItemType) entry[1])
                        .imageUrl("https://s3.readforest.com/items/" + name + ".png")
                        .description((String) entry[2])
                        .build());
            }
        }
    }

    /** 사용자에게 보유하지 않은 모든 소품을 인벤토리로 지급한다. */
    @Transactional
    public void grantAllToUser(User user) {
        for (Item item : itemRepository.findAll()) {
            if (!inventoryItemRepository.existsByUserIdAndItemId(user.getId(), item.getId())) {
                inventoryItemRepository.save(InventoryItem.builder().user(user).item(item).build());
            }
        }
    }
}
