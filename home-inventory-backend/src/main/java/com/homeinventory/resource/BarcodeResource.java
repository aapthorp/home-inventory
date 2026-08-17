package com.homeinventory.resource;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import com.homeinventory.service.BarcodeLookupClient;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/barcode")
@Produces(MediaType.APPLICATION_JSON)
public class BarcodeResource {

    @Inject
    @RestClient
    BarcodeLookupClient barcodeLookupClient;

    /** Matches the mobile app's BarcodeLookupResult type (src/api/barcode.ts). */
    public record BarcodeLookupResult(String barcode, String brand, String name, String imageUrl) {
    }

    @GET
    @Path("/{upc}")
    public BarcodeLookupResult lookup(@PathParam("upc") String upc) {
        BarcodeLookupClient.UpcLookupResponse response = barcodeLookupClient.lookup(upc);
        if (response == null || response.items() == null || response.items().isEmpty()) {
            throw new NotFoundException("No product found for barcode " + upc);
        }
        BarcodeLookupClient.UpcItem item = response.items().get(0);
        String imageUrl = (item.images() != null && !item.images().isEmpty()) ? item.images().get(0) : null;
        return new BarcodeLookupResult(upc, item.brand(), item.title(), imageUrl);
    }
}
