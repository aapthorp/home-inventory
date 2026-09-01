package com.homeinventory.service.itemtype;

import java.util.Map;
import java.util.UUID;

import com.homeinventory.domain.ItemType;

/**
 * The "plugin" contract for a type's extension table. Adding a new item type
 * (e.g. Wine) means: one Flyway migration for its details table, one JPA
 * entity, one implementation of this interface, and one schema entry in
 * ItemTypeSchemas — nothing else changes. ItemResource and both frontends are
 * written against this generic contract, not against any specific type.
 */
public interface ItemTypeDetailsHandler {

    ItemType type();

    /** Flattened key/value view of the details row for this item, empty map if none exists. */
    Map<String, Object> toDetailsMap(UUID itemId);

    /** Upserts the details row for this item from a generic key/value map (as received over the wire). */
    void applyDetails(UUID itemId, Map<String, Object> details);
}
