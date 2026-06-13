package com.readforest.readforest.service;

import com.readforest.readforest.domain.Book;
import com.readforest.readforest.domain.Forest;
import com.readforest.readforest.domain.Tree;
import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.TreeResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.BookRepository;
import com.readforest.readforest.repository.ForestRepository;
import com.readforest.readforest.repository.TreeRepository;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TreeService {

    private final TreeRepository treeRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ForestRepository forestRepository;

    @Transactional
    public TreeResponseDto.Detail plantTree(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOK_NOT_FOUND));

        // Ensure user has a forest
        forestRepository.findByUserId(userId)
                .orElseGet(() -> forestRepository.save(
                        Forest.builder()
                                .user(user)
                                .name(user.getNickname() + "의 숲")
                                .build()
                ));

        Tree tree = Tree.builder()
                .user(user)
                .book(book)
                .currentPage(0)
                .growthRate(0.0)
                .vitality(Tree.Vitality.HEALTHY)
                .isCompleted(false)
                .build();

        Tree savedTree = treeRepository.save(tree);
        return TreeResponseDto.Detail.from(savedTree);
    }

    /**
     * 특정 사용자가 심은 모든 나무 목록을 조회한다.
     *
     * @param userId 사용자 ID
     * @return 해당 사용자의 나무 상세 목록
     */
    public List<TreeResponseDto.Detail> getUserTrees(Long userId) {
        return treeRepository.findByUserId(userId).stream()
                .map(TreeResponseDto.Detail::from)
                .toList();
    }

    public TreeResponseDto.Detail getTreeDetail(Long treeId) {
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new CustomException(ErrorCode.TREE_NOT_FOUND));
        return TreeResponseDto.Detail.from(tree);
    }

    @Transactional
    public void removeTree(Long treeId) {
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new CustomException(ErrorCode.TREE_NOT_FOUND));
        treeRepository.delete(tree);
    }
}
