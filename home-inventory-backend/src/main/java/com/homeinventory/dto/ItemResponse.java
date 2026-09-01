package com.homeinventory.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.homeinventory.domain.Item;
import com.homeinventory.domain.ItemType;

/** Full item representation returned by GET endpoints. */
public record ItemResponse(
    UUID id,
    ItemType itemType,
    String name,
    String description,
    UUID categoryId,
    UUID locationId,
    UUID ownerUserId,
    String barcode,
    String brand,
    String model,
    String serialNumber,
    Item.Condition condition,
    int quantity,
    LocalDate purchaseDate,
    BigDecimal purchasePrice,
    String currency,
    BigDecimal currentEstimatedValue,
    LocalDate warrantyExpiryDate,
    Item.Status status,
    String notes,
    Set<String> tags,
    Set<UUID> collectionIds,
    // Type-specific fields (ISBN/author for BOOK, director/runtime for FILM, etc.) —
    // empty for GENERIC. Populated via the matching ItemTypeDetailsHandler rather than
    // being part of the Item entity itself; see ItemResource.toResponse.
    Map<String, Object> details,
    Instant createdAt,
    Instant updatedAt
) {
    /** details is supplied by the caller (ItemResource) since building it requires a
     *  registry lookup this DTO shouldn't need to know about. */
    public static ItemResponse from(Item item, Map<String, Object> details) {
        return new ItemResponse(
            item.id,
            item.itemType,
            item.name,
            item.description,
            item.categoryId,
            item.locationId,
            item.ownerUserId,
            item.barcode,
            item.brand,
            item.model,
            item.serialNumber,
            item.condition,
            item.quantity,
            item.purchaseDate,
            item.purchasePrice,
            item.currency,
            item.currentEstimatedValue,
            item.warrantyExpiryDate,
            item.status,
            item.notes,
            item.tags,
            item.collections.stream().map(c -> c.id).collect(java.util.stream.Collectors.toSet()),
            details,
            item.createdAt,
            item.updatedAt
        );
    }
}
