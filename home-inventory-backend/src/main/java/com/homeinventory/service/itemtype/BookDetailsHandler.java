package com.homeinventory.service.itemtype;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import com.homeinventory.domain.BookDetails;
import com.homeinventory.domain.ItemType;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class BookDetailsHandler extends AbstractItemTypeDetailsHandler implements ItemTypeDetailsHandler {

    @Override
    public ItemType type() {
        return ItemType.BOOK;
    }

    @Override
    public Map<String, Object> toDetailsMap(UUID itemId) {
        BookDetails details = BookDetails.<BookDetails>find("itemId", itemId).firstResult();
        if (details == null) {
            return Map.of();
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("isbn13", details.isbn13);
        map.put("isbn10", details.isbn10);
        map.put("author", details.author);
        map.put("pageCount", details.pageCount);
        map.put("publisher", details.publisher);
        map.put("publishedYear", details.publishedYear);
        map.put("format", details.format);
        return map;
    }

    @Override
    @Transactional
    public void applyDetails(UUID itemId, Map<String, Object> details) {
        BookDetails entity = BookDetails.<BookDetails>find("itemId", itemId).firstResult();
        if (entity == null) {
            entity = new BookDetails();
            entity.itemId = itemId;
        }
        entity.isbn13 = asString(details.get("isbn13"));
        entity.isbn10 = asString(details.get("isbn10"));
        entity.author = asString(details.get("author"));
        entity.pageCount = asInteger(details.get("pageCount"));
        entity.publisher = asString(details.get("publisher"));
        entity.publishedYear = asInteger(details.get("publishedYear"));
        entity.format = asString(details.get("format"));
        if (entity.id == null) {
            entity.persist();
        }
    }
}
