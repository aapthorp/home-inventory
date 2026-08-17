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

    /** Object key/URL in MinIO/S3 — see StorageService. */
    @Column(nullable = false)
    public String storageUrl;

    public enum AttachmentType {
        PHOTO, RECEIPT, MANUAL, WARRANTY_DOC
    }
}
