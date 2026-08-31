package com.homeinventory.resource;

import java.util.List;
import java.util.UUID;

import com.homeinventory.domain.Location;
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

/**
 * Returns a flat list; the client builds the tree from parentLocationId
 * (see mobile app's Location type). Keeps this endpoint simple and cacheable.
 */
@Path("/locations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LocationResource {

    @Inject
    HouseholdContext householdContext;

    public record LocationRequest(@NotBlank String name, UUID parentLocationId, Location.LocationType type) {
    }

    @GET
    public List<Location> list() {
        return Location.list(
            "householdId = ?1 and deletedAt is null", householdContext.currentHouseholdId());
    }

    @POST
    @Transactional
    public Response create(LocationRequest request) {
        Location location = new Location();
        location.householdId = householdContext.currentHouseholdId();
        location.name = request.name();
        location.parentLocationId = request.parentLocationId();
        location.type = request.type() != null ? request.type() : Location.LocationType.ROOM;
        location.persist();
        return Response.status(Response.Status.CREATED).entity(location).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response softDelete(@PathParam("id") UUID id) {
        Location location = Location.<Location>find(
                "id = ?1 and householdId = ?2 and deletedAt is null", id, householdContext.currentHouseholdId())
            .firstResult();
        if (location == null) {
            throw new NotFoundException("Location not found: " + id);
        }
        location.deletedAt = java.time.Instant.now();
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public Location update(@PathParam("id") UUID id, LocationRequest request) {
        Location location = Location.<Location>find(
                "id = ?1 and householdId = ?2 and deletedAt is null", id, householdContext.currentHouseholdId())
            .firstResult();
        if (location == null) {
            throw new NotFoundException("Location not found: " + id);
        }
        location.name = request.name();
        location.parentLocationId = request.parentLocationId();
        if (request.type() != null) {
            location.type = request.type();
        }
        return location;
    }
}
