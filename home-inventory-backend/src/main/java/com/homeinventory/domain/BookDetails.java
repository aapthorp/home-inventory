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
    public String isbn13;

    @Column
    public String isbn10;

    @Column
    public String author;

    @Column
    public Integer pageCount;

    @Column
    public String publisher;

    @Column
    public Integer publishedYear;

    /** Free-text rather than an enum column — keeps new format values (e.g. a future
     *  "Large print") addable without a migration; the schema endpoint supplies the
     *  suggested options for the dropdown. */
    @Column
    public String format;
}
