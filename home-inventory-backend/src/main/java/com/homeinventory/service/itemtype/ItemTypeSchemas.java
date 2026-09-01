package com.homeinventory.service.itemtype;

import java.util.List;

/**
 * Drives GET /item-types, which both frontends use to render type-specific
 * form fields generically (one form component, not one per type). Adding a
 * type's entry here — alongside its migration, entity, and handler — is the
 * last step of the four-part recipe (see ItemType's javadoc).
 */
public final class ItemTypeSchemas {

    private ItemTypeSchemas() {
    }

    public record Field(String key, String label, String inputType) {
    }

    public record Schema(String code, String label, List<Field> fields) {
    }

    public static final List<Schema> ALL = List.of(
        new Schema("GENERIC", "Generic", List.of()),
        new Schema("BOOK", "Book", List.of(
            new Field("isbn", "ISBN", "text"),
            new Field("author", "Author", "text"),
            new Field("pageCount", "Pages", "number"),
            new Field("publisher", "Publisher", "text"),
            new Field("publishedYear", "Published year", "number")
        )),
        new Schema("FILM", "Film", List.of(
            new Field("director", "Director", "text"),
            new Field("runtimeMinutes", "Runtime (minutes)", "number"),
            new Field("studio", "Studio", "text"),
            new Field("releaseYear", "Release year", "number")
        )),
        new Schema("MUSIC_ALBUM", "Music album", List.of(
            new Field("artist", "Artist", "text"),
            new Field("label", "Label", "text"),
            new Field("releaseYear", "Release year", "number"),
            new Field("trackCount", "Track count", "number")
        ))
    );
}
