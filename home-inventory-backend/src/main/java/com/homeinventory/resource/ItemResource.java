package com.homeinventory.resource;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.homeinventory.domain.Collection;
import com.homeinventory.domain.Item;
import com.homeinventory.domain.ItemType;
import com.homeinventory.dto.ItemRequest;
import com.homeinventory.dto.ItemResponse;
import com.homeinventory.service.HouseholdContext;
import com.homeinventory.service.itemtype.ItemTypeRegistry;

import io.quarkus.panache.common.Parameters;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/items")
@Produces(MediaType.APPLICATION_JSON)
public class ItemResource {

    @Inject
    HouseholdContext householdContext;

    @Inject
    ItemTypeRegistry itemTypeRegistry;

    @GET
    public List<ItemResponse> search(
        @QueryParam("locationId") UUID locationId,
        @QueryParam("categoryId") UUID categoryId,
        @QueryParam("collectionId") UUID collectionId,
        @QueryParam("query") String query
    ) {
        UUID householdId = householdContext.currentHouseholdId();

        StringBuilder jpql = new StringBuilder("householdId = :householdId and deletedAt is null");
        Parameters params = Parameters.with("householdId", householdId);

        if (locationId != null) {
            jpql.append(" and locationId = :locationId");
            params = params.and("locationId", locationId);
        }
        if (categoryId != null) {
            jpql.append(" and categoryId = :categoryId");
            params = params.and("categoryId", categoryId);
        }
        if (collectionId != null) {
            jpql.append(" and :collectionId in elements(collections)");
            params = params.and("collectionId", collectionId);
        }
        if (query != null && !query.isBlank()) {
            jpql.append(" and (lower(name) like :q or lower(brand) like :q or lower(serialNumber) like :q)");
            params = params.and("q", "%" + query.toLowerCase() + "%");
        }

        return Item.<Item>find(jpql.toString(), params)
            .list()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public ItemResponse getOne(@PathParam("id") UUID id) {
        Item item = findOwnedOrThrow(id);
        return toResponse(item);
    }

    @POST
    @Transactional
    public Response create(@Valid ItemRequest request) {
        Item item = new Item();
        item.householdId = householdContext.currentHouseholdId();
        applyRequest(item, request);
        item.persist();
        applyDetails(item, request);
        return Response.status(Response.Status.CREATED).entity(toResponse(item)).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public ItemResponse update(@PathParam("id") UUID id, ItemRequest request) {
        Item item = findOwnedOrThrow(id);
        applyRequest(item, request);
        applyDetails(item, request);
        return toResponse(item);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response softDelete(@PathParam("id") UUID id) {
        Item item = findOwnedOrThrow(id);
        item.deletedAt = java.time.Instant.now();
        return Response.noContent().build();
    }

    private Item findOwnedOrThrow(UUID id) {
        UUID householdId = householdContext.currentHouseholdId();
        Item item = Item.<Item>find("id = ?1 and householdId = ?2 and deletedAt is null", id, householdId)
            .firstResult();
        if (item == null) {
            throw new NotFoundException("Item not found: " + id);
        }
        return item;
    }

    /** Applies non-null fields from the request onto the entity — shared by create and update. */
    private void applyRequest(Item item, ItemRequest r) {
        if (r.itemType() != null) item.itemType = r.itemType();
        item.name = r.name();
        item.description = r.description();
        item.categoryId = r.categoryId();
        item.locationId = r.locationId();
        item.ownerUserId = r.ownerUserId();
        item.barcode = r.barcode();
        item.brand = r.brand();
        item.model = r.model();
        item.serialNumber = r.serialNumber();
        if (r.condition() != null) item.condition = r.condition();
        if (r.quantity() != null) item.quantity = r.quantity();
        item.purchaseDate = r.purchaseDate();
        item.purchasePrice = r.purchasePrice();
        item.currency = r.currency();
        item.currentEstimatedValue = r.currentEstimatedValue();
        item.warrantyExpiryDate = r.warrantyExpiryDate();
        if (r.status() != null) item.status = r.status();
        item.notes = r.notes();
        if (r.tags() != null) item.tags = r.tags();
        if (r.collectionIds() != null) {
            Set<Collection> collections = r.collectionIds().stream()
                .map(cid -> Collection.<Collection>findById(cid))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
            item.collections = collections;
        }
    }

    /** Dispatches the generic details map to whichever handler matches item.itemType.
     *  No-op for GENERIC or if details weren't included in the request (PATCH without
     *  touching type-specific fields, for example). */
    private void applyDetails(Item item, ItemRequest r) {
        if (item.itemType == ItemType.GENERIC || r.details() == null) {
            return;
        }
        itemTypeRegistry.handlerFor(item.itemType)
            .ifPresent(handler -> handler.applyDetails(item.id, r.details()));
    }

    private ItemResponse toResponse(Item item) {
        Map<String, Object> details = item.itemType == ItemType.GENERIC
            ? Map.of()
            : itemTypeRegistry.handlerFor(item.itemType)
                .map(handler -> handler.toDetailsMap(item.id))
                .orElse(Map.of());
        return ItemResponse.from(item, details);
    }
}
