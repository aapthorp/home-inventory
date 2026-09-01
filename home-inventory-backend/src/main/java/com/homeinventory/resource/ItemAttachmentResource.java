package com.homeinventory.resource;

import java.nio.file.Files;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import com.homeinventory.domain.Item;
import com.homeinventory.domain.ItemAttachment;
import com.homeinventory.service.HouseholdContext;
import com.homeinventory.service.StorageService;

import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Multiple attachments per item, each independently labelled and typed —
 * PHOTO/RECEIPT/MANUAL/WARRANTY_DOC share this one entity/table rather than
 * separate tables per type (see architecture doc, section 4). Upload goes
 * straight through Quarkus (simplest for MVP); presigned PUT direct-to-MinIO
 * is a reasonable v2 optimization if large mobile uploads ever feel slow.
 */
@Path("/items/{itemId}/attachments")
@Produces(MediaType.APPLICATION_JSON)
public class ItemAttachmentResource {

    @Inject
    HouseholdContext householdContext;

    @Inject
    StorageService storageService;

    public record AttachmentResponse(
        UUID id,
        ItemAttachment.AttachmentType type,
        String label,
        String contentType,
        Long sizeBytes,
        int sortOrder,
        String downloadUrl,
        Instant createdAt
    ) {
    }

    public record AttachmentUpdateRequest(String label, ItemAttachment.AttachmentType type, Integer sortOrder) {
    }

    public static class UploadForm {
        @RestForm
        public FileUpload file;

        @RestForm
        @PartType(MediaType.TEXT_PLAIN)
        public String type;

        @RestForm
        @PartType(MediaType.TEXT_PLAIN)
        public String label;
    }

    @GET
    public List<AttachmentResponse> list(@PathParam("itemId") UUID itemId) {
        Item item = findOwnedItemOrThrow(itemId);
        return ItemAttachment.<ItemAttachment>find(
                "itemId = ?1 and deletedAt is null", Sort.by("sortOrder").and("createdAt"), item.id)
            .list()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Transactional
    public Response upload(@PathParam("itemId") UUID itemId, UploadForm form) {
        Item item = findOwnedItemOrThrow(itemId);

        if (form.file == null) {
            throw new WebApplicationException("Missing file part", Response.Status.BAD_REQUEST);
        }
        ItemAttachment.AttachmentType type = parseType(form.type);

        String safeFileName = sanitizeFileName(form.file.fileName());
        String objectKey = item.householdId + "/" + item.id + "/" + UUID.randomUUID() + "-" + safeFileName;

        try {
            long size = form.file.size();
            try (var stream = Files.newInputStream(form.file.uploadedFile())) {
                storageService.upload(objectKey, stream, size, form.file.contentType());
            }

            ItemAttachment attachment = new ItemAttachment();
            attachment.itemId = item.id;
            attachment.type = type;
            attachment.label = (form.label != null && !form.label.isBlank()) ? form.label.trim() : null;
            attachment.storageUrl = objectKey;
            attachment.contentType = form.file.contentType();
            attachment.sizeBytes = size;
            attachment.persist();

            return Response.status(Response.Status.CREATED).entity(toResponse(attachment)).build();
        } catch (WebApplicationException e) {
            throw e;
        } catch (Exception e) {
            throw new WebApplicationException("Failed to store file: " + e.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @PATCH
    @Path("/{attachmentId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public AttachmentResponse update(
        @PathParam("itemId") UUID itemId,
        @PathParam("attachmentId") UUID attachmentId,
        AttachmentUpdateRequest request
    ) {
        Item item = findOwnedItemOrThrow(itemId);
        ItemAttachment attachment = findAttachmentOrThrow(item.id, attachmentId);

        if (request.label() != null) {
            attachment.label = request.label().isBlank() ? null : request.label().trim();
        }
        if (request.type() != null) {
            attachment.type = request.type();
        }
        if (request.sortOrder() != null) {
            attachment.sortOrder = request.sortOrder();
        }
        return toResponse(attachment);
    }

    @DELETE
    @Path("/{attachmentId}")
    @Transactional
    public Response delete(@PathParam("itemId") UUID itemId, @PathParam("attachmentId") UUID attachmentId) {
        Item item = findOwnedItemOrThrow(itemId);
        ItemAttachment attachment = findAttachmentOrThrow(item.id, attachmentId);

        try {
            storageService.delete(attachment.storageUrl);
        } catch (Exception e) {
            // Swallow — don't block the DB-level delete on a storage-layer failure (e.g. the
            // object is already gone). Acceptable for MVP; revisit if orphaned objects in MinIO
            // become a real problem (a periodic reconciliation job would be the fix).
        }
        attachment.deletedAt = Instant.now();
        return Response.noContent().build();
    }

    private Item findOwnedItemOrThrow(UUID itemId) {
        UUID householdId = householdContext.currentHouseholdId();
        Item item = Item.<Item>find("id = ?1 and householdId = ?2 and deletedAt is null", itemId, householdId)
            .firstResult();
        if (item == null) {
            throw new NotFoundException("Item not found: " + itemId);
        }
        return item;
    }

    private ItemAttachment findAttachmentOrThrow(UUID itemId, UUID attachmentId) {
        ItemAttachment attachment = ItemAttachment.<ItemAttachment>find(
                "id = ?1 and itemId = ?2 and deletedAt is null", attachmentId, itemId)
            .firstResult();
        if (attachment == null) {
            throw new NotFoundException("Attachment not found: " + attachmentId);
        }
        return attachment;
    }

    private ItemAttachment.AttachmentType parseType(String raw) {
        if (raw == null || raw.isBlank()) {
            return ItemAttachment.AttachmentType.PHOTO;
        }
        try {
            return ItemAttachment.AttachmentType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid attachment type: " + raw, Response.Status.BAD_REQUEST);
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "file";
        }
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private AttachmentResponse toResponse(ItemAttachment attachment) {
        String downloadUrl;
        try {
            downloadUrl = storageService.getDownloadUrl(attachment.storageUrl);
        } catch (Exception e) {
            downloadUrl = null;
        }
        return new AttachmentResponse(
            attachment.id,
            attachment.type,
            attachment.label,
            attachment.contentType,
            attachment.sizeBytes,
            attachment.sortOrder,
            downloadUrl,
            attachment.createdAt
        );
    }
}
