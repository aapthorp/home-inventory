package com.homeinventory.resource;

import java.util.List;

import com.homeinventory.service.itemtype.ItemTypeSchemas;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/item-types")
@Produces(MediaType.APPLICATION_JSON)
public class ItemTypeResource {

    @GET
    public List<ItemTypeSchemas.Schema> list() {
        return ItemTypeSchemas.ALL;
    }
}
