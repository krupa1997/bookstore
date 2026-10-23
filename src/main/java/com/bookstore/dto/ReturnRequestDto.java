package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestDto {

    @NotBlank(message = "Return reason is required")
    private String reason;

    @NotEmpty(message = "At least one item ID must be specified for return")
    private List<String> itemIds;
}
