package com.harmadavtian.disneyapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class DisneyappApplication {

    public static void main(String[] args) {
        SpringApplication.run(DisneyappApplication.class, args);
    }

}