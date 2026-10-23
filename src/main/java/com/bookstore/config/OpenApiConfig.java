package com.bookstore.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bookstoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("E-Commerce Book Platform API")
                        .description("REST API for Book browsing, cart management, checkout, payments, shipping, and 48-hour order cancellation window.")
                        .version("1.0.0")
                        .contact(new Contact().name("API Support").email("support@bookstore.example.com")))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Token obtained from /auth/login or /auth/register"))
                        .addSecuritySchemes("GuestCartToken", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-Guest-Cart-Token")
                                .description("Guest cart identifier for anonymous users")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"));
    }
}
