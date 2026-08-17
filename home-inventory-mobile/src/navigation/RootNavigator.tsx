import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ItemListScreen from "@/screens/ItemListScreen";
import ItemDetailScreen from "@/screens/ItemDetailScreen";
import AddItemScreen from "@/screens/AddItemScreen";
import BarcodeScanScreen from "@/screens/BarcodeScanScreen";
import CollectionsScreen from "@/screens/CollectionsScreen";
import type { UUID } from "@/types/inventory";

export type RootStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: UUID };
  AddItem: { prefill?: { barcode?: string; brand?: string; name?: string } } | undefined;
  BarcodeScan: undefined;
  Collections: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ItemList">
        <Stack.Screen name="ItemList" component={ItemListScreen} options={{ title: "Inventory" }} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: "Item" }} />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: "Add item" }} />
        <Stack.Screen
          name="BarcodeScan"
          component={BarcodeScanScreen}
          options={{ title: "Scan barcode", presentation: "modal" }}
        />
        <Stack.Screen name="Collections" component={CollectionsScreen} options={{ title: "Collections" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
