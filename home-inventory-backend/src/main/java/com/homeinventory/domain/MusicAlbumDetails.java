package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "music_album_details")
public class MusicAlbumDetails extends AbstractEntity {

    @Column(nullable = false, unique = true)
    public UUID itemId;

    @Column
    public String artist;

    @Column
    public String label;

    @Column
    public Integer releaseYear;

    @Column
    public Integer trackCount;

    @Column
    public String format;

    @Column
    public String ean;

    @Column
    public String upc;
}
