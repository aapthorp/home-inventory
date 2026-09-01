package com.homeinventory.service.itemtype;

import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;

import com.homeinventory.domain.ItemType;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;

/**
 * Collects every ItemTypeDetailsHandler bean via CDI — a new type's handler
 * just needs @ApplicationScoped on the class to be picked up here automatically,
 * no manual registration.
 */
@ApplicationScoped
public class ItemTypeRegistry {

    @Inject
    Instance<ItemTypeDetailsHandler> handlerInstances;

    private Map<ItemType, ItemTypeDetailsHandler> handlers;

    @PostConstruct
    void init() {
        handlers = new EnumMap<>(ItemType.class);
        for (ItemTypeDetailsHandler handler : handlerInstances) {
            handlers.put(handler.type(), handler);
        }
    }

    public Optional<ItemTypeDetailsHandler> handlerFor(ItemType type) {
        return Optional.ofNullable(handlers.get(type));
    }
}
