package com.homeinventory.service.itemtype;

/** JSON numbers deserialize as various Number subtypes depending on the client — these
 *  helpers normalize whatever comes in from the generic details map. */
abstract class AbstractItemTypeDetailsHandler {

    protected String asString(Object value) {
        return value != null ? value.toString() : null;
    }

    protected Integer asInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        String s = value.toString().trim();
        return s.isEmpty() ? null : Integer.parseInt(s);
    }
}
