package com.homeinventory.service.itemtype;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import com.homeinventory.domain.FilmDetails;
import com.homeinventory.domain.ItemType;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FilmDetailsHandler extends AbstractItemTypeDetailsHandler implements ItemTypeDetailsHandler {

    @Override
    public ItemType type() {
        return ItemType.FILM;
    }

    @Override
    public Map<String, Object> toDetailsMap(UUID itemId) {
        FilmDetails details = FilmDetails.<FilmDetails>find("itemId", itemId).firstResult();
        if (details == null) {
            return Map.of();
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("director", details.director);
        map.put("runtimeMinutes", details.runtimeMinutes);
        map.put("studio", details.studio);
        map.put("releaseYear", details.releaseYear);
        map.put("format", details.format);
        map.put("actors", details.actors);
        return map;
    }

    @Override
    @Transactional
    public void applyDetails(UUID itemId, Map<String, Object> details) {
        FilmDetails entity = FilmDetails.<FilmDetails>find("itemId", itemId).firstResult();
        if (entity == null) {
            entity = new FilmDetails();
            entity.itemId = itemId;
        }
        entity.director = asString(details.get("director"));
        entity.runtimeMinutes = asInteger(details.get("runtimeMinutes"));
        entity.studio = asString(details.get("studio"));
        entity.releaseYear = asInteger(details.get("releaseYear"));
        entity.format = asString(details.get("format"));
        entity.actors = asString(details.get("actors"));
        if (entity.id == null) {
            entity.persist();
        }
    }
}
