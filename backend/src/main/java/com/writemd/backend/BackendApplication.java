package com.writemd.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

    public static void main(String[] args) {
//        Dotenv dotenv = Dotenv.configure()
//            .systemProperties()
//            .load();

        SpringApplication.run(BackendApplication.class, args);
    }

}
