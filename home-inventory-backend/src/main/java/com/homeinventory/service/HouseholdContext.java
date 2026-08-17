package com.homeinventory.service;

import java.util.UUID;

import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;

/**
 * Stand-in for real auth. Once quarkus-smallrye-jwt is wired to an identity
 * provider, replace this with a claim extracted from the validated token —
 * every resource already depends on this bean rather than reading the header
 * directly, so that's a one-file change.
 */
@RequestScoped
public class HouseholdContext {

    public static final String HEADER = "X-Household-Id";

    @Context
    HttpHeaders headers;

    public UUID currentHouseholdId() {
        String value = headers.getHeaderString(HEADER);
        if (value == null) {
            throw new WebApplicationException(
                "Missing " + HEADER + " header (temporary stand-in for auth)",
                Response.Status.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException(HEADER + " must be a UUID", Response.Status.BAD_REQUEST);
        }
    }
}
