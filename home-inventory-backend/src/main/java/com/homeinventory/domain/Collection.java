package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "collection")
public class Collection extends AbstractEntity {

    @Column(nullable = false)
    public UUID householdId;

    @Column(nullable = false)
    public String name;

    @Column
    public String description;

    @Enumerated(EnumType.STRING)
    @Column
    public CollectionType type;

    public enum CollectionType {
        MUSIC, VIDEO, BOOKS, GENERAL
    }
}
