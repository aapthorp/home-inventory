package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "category")
public class Category extends AbstractEntity {

    @Column(nullable = false)
    public UUID householdId;

    @Column(nullable = false)
    public String name;

    /** e.g. Electronics -> Audio -> Headphones. Null = top level. */
    @Column
    public UUID parentCategoryId;
}
