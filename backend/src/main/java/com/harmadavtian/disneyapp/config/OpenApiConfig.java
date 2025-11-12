package com.harmadavtian.disneyapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration class for OpenAPI/Swagger documentation.
 * Defines API metadata, server URLs, and documentation settings.
 */
@Configuration
public class OpenApiConfig {

        /**
         * Configures the OpenAPI documentation for the Disney App API.
         * 
         * @return OpenAPI configuration with metadata and server information
         */
        @Bean
        public OpenAPI disneyAppOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Disney App API")
                                                .description("Comprehensive API for Disney character catalog, movies, and carousel features. "
                                                                +
                                                                "This API provides endpoints for managing and retrieving Disney characters, movies, "
                                                                +
                                                                "and dynamic carousel content for an immersive Disney-themed web application.")
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("Disney App Development Team")
                                                                .email("hdavtian@example.com")
                                                                .url("https://github.com/hdavtian/my-disney-app"))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")))
                                .servers(List.of(
                                                new Server()
                                                                .url("http://localhost:8080")
                                                                .description("Local Development Server"),
                                                new Server()
                                                                .url("https://api.movie-app.disney.harma.dev")
                                                                .description("Production Server")));
        }
}
