package com.homeinventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.homeinventory.domain.Item;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Used for both create (POST) and update (PATCH — all fields optional in practice,
 * null means "leave unchanged" at the resource layer for PATCH).
 */
public record ItemRequest(
    @NotBlank String name,
    String description,
    UUID categoryId,
    UUID locationId,
    UUID ownerUserId,
    String barcode,
    String brand,
    String model,
    String serialNumber,
    Item.Condition condition,
    @Min(0) Integer quantity,
    LocalDate purchaseDate,
    BigDecimal purchasePrice,
    String currency,
    BigDecimal currentEstimatedValue,
    LocalDate warrantyExpiryDate,
    Item.Status status,
    String notes,
    Set<String> tags,
    Set<UUID> collectionIds
) {
}
