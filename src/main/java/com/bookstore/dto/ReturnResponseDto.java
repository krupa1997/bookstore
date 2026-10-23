package com.bookstore.dto;

import com.bookstore.model.ReturnStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnResponseDto {
    private String returnId;
    private String orderId;
    private ReturnStatus status;
    private String returnShipmentTrackingNumber;
}
