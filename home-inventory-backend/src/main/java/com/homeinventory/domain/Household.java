package com.homeinventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "household")
public class Household extends AbstractEntity {

    @Column(nullable = false)
    public String name;
}
