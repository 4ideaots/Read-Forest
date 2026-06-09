package com.readforest.readforest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReadforestApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReadforestApplication.class, args);
	}

}
