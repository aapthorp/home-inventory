package com.homeinventory.domain;

import java.time.Instant;
import java.util.UUID;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * UUID primary keys (not auto-increment) and updatedAt/deletedAt instead of hard
 * deletes are deliberate: they're the two conventions that let offline sync be
 * added later without a schema rewrite. See architecture doc, section 5.
 */
@MappedSuperclass
public abstract class AbstractEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    public UUID id;

    @Column(nullable = false, updatable = false)
    public Instant createdAt;

    @Column(nullable = false)
    public Instant updatedAt;

    @Column
    public Instant deletedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
