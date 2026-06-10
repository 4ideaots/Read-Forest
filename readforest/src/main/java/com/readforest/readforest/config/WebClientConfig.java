package com.readforest.readforest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient 설정 클래스.
 *
 * <p>외부 API(카카오 도서 검색 등) 호출에 사용할 WebClient 빈을 등록한다.</p>
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
