import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ItemListScreen from "@/screens/ItemListScreen";
import ItemDetailScreen from "@/screens/ItemDetailScreen";
import ItemFormScreen from "@/screens/ItemFormScreen";
import BarcodeScanScreen from "@/screens/BarcodeScanScreen";
import LocationsScreen from "@/screens/LocationsScreen";
import CategoriesScreen from "@/screens/CategoriesScreen";
import CollectionsScreen from "@/screens/CollectionsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import type { UUID } from "@/types/inventory";

/** The Items tab's own nested stack — list -> detail -> form -> scan.
 *  Exported so screens within this stack can type their navigation props. */
export type ItemsStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: UUID };
  ItemForm: { itemId?: UUID; prefill?: { barcode?: string; brand?: string; name?: string } };
  BarcodeScan: undefined;
};

export type RootTabParamList = {
  ItemsTab: undefined;
  Locations: undefined;
  Categories: undefined;
  Collections: undefined;
  Settings: undefined;
};

const ItemsStack = createNativeStackNavigator<ItemsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function ItemsStackNavigator() {
  return (
    <ItemsStack.Navigator initialRouteName="ItemList">
      <ItemsStack.Screen name="ItemList" component={ItemListScreen} options={{ title: "Inventory" }} />
      <ItemsStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: "Item" }} />
      <ItemsStack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: "Add item" }} />
      <ItemsStack.Screen
        name="BarcodeScan"
        component={BarcodeScanScreen}
        options={{ title: "Scan barcode", presentation: "modal" }}
      />
    </ItemsStack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="ItemsTab" component={ItemsStackNavigator} options={{ title: "Items" }} />
        <Tab.Screen
          name="Locations"
          component={LocationsScreen}
          options={{ headerShown: true, title: "Locations" }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ headerShown: true, title: "Categories" }}
        />
        <Tab.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{ headerShown: true, title: "Collections" }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "Settings" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
