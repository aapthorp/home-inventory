package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_details")
public class BookDetails extends AbstractEntity {

    @Column(nullable = false, unique = true)
    public UUID itemId;

    @Column
    public String isbn;

    @Column
    public String author;

    @Column
    public Integer pageCount;

    @Column
    public String publisher;

    @Column
    public Integer publishedYear;
}
