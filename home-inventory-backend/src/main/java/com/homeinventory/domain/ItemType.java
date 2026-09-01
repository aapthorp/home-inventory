package com.homeinventory.domain;

/**
 * Adding a new type here is one part of a four-part recipe: this enum value,
 * a Flyway migration for its details table, a *Details entity, and an
 * ItemTypeDetailsHandler implementation (see that interface's javadoc).
 * Nothing on the frontend needs to change — forms are schema-driven off
 * GET /item-types.
 */
public enum ItemType {
    GENERIC, BOOK, FILM, MUSIC_ALBUM
}
