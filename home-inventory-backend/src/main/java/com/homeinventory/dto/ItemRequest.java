package com.homeinventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.homeinventory.domain.Item;
import com.homeinventory.domain.ItemType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Used for both create (POST) and update (PATCH — all fields optional in practice,
 * null means "leave unchanged" at the resource layer for PATCH).
 */
public record ItemRequest(
    ItemType itemType,
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
    Set<UUID> collectionIds,
    // Generic key/value bag matching whichever schema GET /item-types describes for
    // itemType — e.g. {"isbn": "...", "author": "..."} for BOOK. Null/omitted for GENERIC.
    Map<String, Object> details
) {
}
