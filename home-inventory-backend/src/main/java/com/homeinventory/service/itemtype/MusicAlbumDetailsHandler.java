package com.homeinventory.service.itemtype;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import com.homeinventory.domain.ItemType;
import com.homeinventory.domain.MusicAlbumDetails;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MusicAlbumDetailsHandler extends AbstractItemTypeDetailsHandler implements ItemTypeDetailsHandler {

    @Override
    public ItemType type() {
        return ItemType.MUSIC_ALBUM;
    }

    @Override
    public Map<String, Object> toDetailsMap(UUID itemId) {
        MusicAlbumDetails details = MusicAlbumDetails.<MusicAlbumDetails>find("itemId", itemId).firstResult();
        if (details == null) {
            return Map.of();
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("artist", details.artist);
        map.put("label", details.label);
        map.put("releaseYear", details.releaseYear);
        map.put("trackCount", details.trackCount);
        map.put("format", details.format);
        map.put("ean", details.ean);
        map.put("upc", details.upc);
        return map;
    }

    @Override
    @Transactional
    public void applyDetails(UUID itemId, Map<String, Object> details) {
        MusicAlbumDetails entity = MusicAlbumDetails.<MusicAlbumDetails>find("itemId", itemId).firstResult();
        if (entity == null) {
            entity = new MusicAlbumDetails();
            entity.itemId = itemId;
        }
        entity.artist = asString(details.get("artist"));
        entity.label = asString(details.get("label"));
        entity.releaseYear = asInteger(details.get("releaseYear"));
        entity.trackCount = asInteger(details.get("trackCount"));
        entity.format = asString(details.get("format"));
        entity.ean = asString(details.get("ean"));
        entity.upc = asString(details.get("upc"));
        if (entity.id == null) {
            entity.persist();
        }
    }
}
