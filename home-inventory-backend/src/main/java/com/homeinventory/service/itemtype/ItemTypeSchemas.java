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

    public record Field(String key, String label, String inputType, List<String> options) {
        /** Convenience for the common case (text/number) where there's no fixed option list. */
        public Field(String key, String label, String inputType) {
            this(key, label, inputType, null);
        }
    }

    public record Schema(String code, String label, List<Field> fields) {
    }

    private static final List<String> BOOK_FORMATS = List.of("Hardback", "Paperback", "Ebook", "Audiobook");
    private static final List<String> MUSIC_FORMATS = List.of("CD", "Vinyl", "Cassette", "Digital");
    private static final List<String> FILM_FORMATS = List.of("DVD", "Blu-ray", "4K UHD", "Digital");

    public static final List<Schema> ALL = List.of(
        new Schema("GENERIC", "Generic", List.of()),
        new Schema("BOOK", "Book", List.of(
            new Field("format", "Format", "select", BOOK_FORMATS),
            new Field("isbn13", "ISBN-13", "text"),
            new Field("isbn10", "ISBN-10", "text"),
            new Field("author", "Author", "text"),
            new Field("pageCount", "Pages", "number"),
            new Field("publisher", "Publisher", "text"),
            new Field("publishedYear", "Published year", "number")
        )),
        new Schema("FILM", "Film", List.of(
            new Field("format", "Format", "select", FILM_FORMATS),
            new Field("director", "Director", "text"),
            new Field("actors", "Actors (comma separated)", "text"),
            new Field("runtimeMinutes", "Runtime (minutes)", "number"),
            new Field("studio", "Studio", "text"),
            new Field("releaseYear", "Release year", "number")
        )),
        new Schema("MUSIC_ALBUM", "Music album", List.of(
            new Field("format", "Format", "select", MUSIC_FORMATS),
            new Field("artist", "Artist", "text"),
            new Field("label", "Label", "text"),
            new Field("ean", "EAN", "text"),
            new Field("upc", "UPC", "text"),
            new Field("releaseYear", "Release year", "number"),
            new Field("trackCount", "Track count", "number")
        ))
    );
}
