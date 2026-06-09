package com.readforest.readforest.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "forest_decorations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForestDecoration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", nullable = false)
    private Forest forest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private Double positionX;

    @Column(nullable = false)
    private Double positionY;

    @Column(nullable = false)
    private Boolean isPlaced;
}
