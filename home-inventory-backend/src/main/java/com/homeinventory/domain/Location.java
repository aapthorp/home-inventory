package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "location")
public class Location extends AbstractEntity {

    @Column(nullable = false)
    public UUID householdId;

    @Column(nullable = false)
    public String name;

    /** Self-referencing: House -> Garage -> Shelf 3 -> Box B. Null = top level. */
    @Column
    public UUID parentLocationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public LocationType type;

    public enum LocationType {
        ROOM, CONTAINER, SHELF, BOX
    }
}
