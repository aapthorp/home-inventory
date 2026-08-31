package com.homeinventory.resource;

import java.util.List;
import java.util.UUID;

import com.homeinventory.domain.Collection;
import com.homeinventory.service.HouseholdContext;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/collections")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CollectionResource {

    @Inject
    HouseholdContext householdContext;

    public record CollectionRequest(@NotBlank String name, String description, Collection.CollectionType type) {
    }

    @GET
    public List<Collection> list() {
        return Collection.list(
            "householdId = ?1 and deletedAt is null", householdContext.currentHouseholdId());
    }

    @POST
    @Transactional
    public Response create(CollectionRequest request) {
        Collection collection = new Collection();
        collection.householdId = householdContext.currentHouseholdId();
        collection.name = request.name();
        collection.description = request.description();
        collection.type = request.type();
        collection.persist();
        return Response.status(Response.Status.CREATED).entity(collection).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response softDelete(@PathParam("id") UUID id) {
        Collection collection = Collection.<Collection>find(
                "id = ?1 and householdId = ?2 and deletedAt is null", id, householdContext.currentHouseholdId())
            .firstResult();
        if (collection == null) {
            throw new NotFoundException("Collection not found: " + id);
        }
        collection.deletedAt = java.time.Instant.now();
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public Collection update(@PathParam("id") UUID id, CollectionRequest request) {
        Collection collection = Collection.<Collection>find(
                "id = ?1 and householdId = ?2 and deletedAt is null", id, householdContext.currentHouseholdId())
            .firstResult();
        if (collection == null) {
            throw new NotFoundException("Collection not found: " + id);
        }
        collection.name = request.name();
        collection.description = request.description();
        if (request.type() != null) {
            collection.type = request.type();
        }
        return collection;
    }
}
