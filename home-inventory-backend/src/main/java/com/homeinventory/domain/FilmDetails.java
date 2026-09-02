package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "film_details")
public class FilmDetails extends AbstractEntity {

    @Column(nullable = false, unique = true)
    public UUID itemId;

    @Column
    public String director;

    @Column
    public Integer runtimeMinutes;

    @Column
    public String studio;

    @Column
    public Integer releaseYear;

    @Column
    public String format;

    /** Comma-separated names rather than a normalized cast/People table — consistent
     *  with how tags are entered elsewhere (comma-separated text input). Revisit if
     *  per-actor search/filtering becomes a real need. */
    @Column
    public String actors;
}
