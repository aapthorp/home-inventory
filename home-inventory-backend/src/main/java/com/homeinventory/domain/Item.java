package com.homeinventory.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "item")
public class Item extends AbstractEntity {

    @Column(nullable = false)
    public UUID householdId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ItemType itemType = ItemType.GENERIC;

    @Column(nullable = false)
    public String name;

    @Column
    public String description;

    @Column
    public UUID categoryId;

    @Column
    public UUID locationId;

    @Column
    public UUID ownerUserId;

    @Column
    public String barcode;

    @Column
    public String brand;

    @Column
    public String model;

    @Column
    public String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Condition condition = Condition.GOOD;

    @Column(nullable = false)
    public int quantity = 1;

    @Column
    public LocalDate purchaseDate;

    @Column
    public BigDecimal purchasePrice;

    @Column
    public String currency;

    @Column
    public BigDecimal currentEstimatedValue;

    @Column
    public LocalDate warrantyExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status = Status.OWNED;

    @Column
    public String notes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "item_tag", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "tag")
    public Set<String> tags = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "collection_item",
        joinColumns = @JoinColumn(name = "item_id"),
        inverseJoinColumns = @JoinColumn(name = "collection_id")
    )
    public Set<Collection> collections = new HashSet<>();

    public enum Condition {
        NEW, GOOD, FAIR, POOR
    }

    public enum Status {
        OWNED, LOANED_OUT, SOLD, DISPOSED, LOST
    }
}
