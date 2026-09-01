package com.homeinventory.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "item_attachment")
public class ItemAttachment extends AbstractEntity {

    @Column(nullable = false)
    public UUID itemId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public AttachmentType type;

    /** User-provided label, e.g. "Front", "Serial number plate", "Receipt from Amazon". Optional. */
    @Column
    public String label;

    /** Object key in MinIO — despite the column name (kept for migration compatibility), this
     *  is a key like "{householdId}/{itemId}/{attachmentId}-{filename}", not a full URL. The
     *  actual downloadable URL is generated on read via StorageService's presigned GET. */
    @Column(nullable = false)
    public String storageUrl;

    @Column
    public String contentType;

    @Column
    public Long sizeBytes;

    /** Lets the UI show attachments in a stable, user-controlled order (e.g. drag-reorder later). */
    @Column(nullable = false)
    public int sortOrder = 0;

    public enum AttachmentType {
        PHOTO, RECEIPT, MANUAL, WARRANTY_DOC
    }
}

