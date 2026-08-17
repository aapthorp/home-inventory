package com.homeinventory.resource;

import java.util.List;
import java.util.UUID;

import com.homeinventory.domain.Category;
import com.homeinventory.service.HouseholdContext;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @Inject
    HouseholdContext householdContext;

    public record CategoryRequest(@NotBlank String name, UUID parentCategoryId) {
    }

    @GET
    public List<Category> list() {
        return Category.list(
            "householdId = ?1 and deletedAt is null", householdContext.currentHouseholdId());
    }

    @POST
    @Transactional
    public Response create(CategoryRequest request) {
        Category category = new Category();
        category.householdId = householdContext.currentHouseholdId();
        category.name = request.name();
        category.parentCategoryId = request.parentCategoryId();
        category.persist();
        return Response.status(Response.Status.CREATED).entity(category).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response softDelete(@PathParam("id") UUID id) {
        Category category = Category.<Category>find(
                "id = ?1 and householdId = ?2 and deletedAt is null", id, householdContext.currentHouseholdId())
            .firstResult();
        if (category == null) {
            throw new NotFoundException("Category not found: " + id);
        }
        category.deletedAt = java.time.Instant.now();
        return Response.noContent().build();
    }
}
