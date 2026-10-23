package com.bookstore.dto;

import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
}
