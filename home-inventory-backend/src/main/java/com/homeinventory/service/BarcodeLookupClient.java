package com.homeinventory.service;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/**
 * Swap the base URL (home-inventory.barcode.api-base-url) and this interface's
 * shape for whichever provider you settle on (UPCitemdb, Barcode Lookup API, etc.).
 * Kept server-side so the API key never ships in the mobile app.
 */
@RegisterRestClient(configKey = "barcode-api")
public interface BarcodeLookupClient {

    @GET
    @Path("/lookup")
    @Produces(MediaType.APPLICATION_JSON)
    UpcLookupResponse lookup(@QueryParam("upc") String upc);

    record UpcLookupResponse(String code, java.util.List<UpcItem> items) {
    }

    record UpcItem(String title, String brand, String description, java.util.List<String> images) {
    }
}
