import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ItemsPage from "@/pages/ItemsPage";
import ItemFormPage from "@/pages/ItemFormPage";
import LocationsPage from "@/pages/LocationsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import CollectionsPage from "@/pages/CollectionsPage";
import SettingsPage from "@/pages/SettingsPage";
import "@/styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/items" replace />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/new" element={<ItemFormPage />} />
            <Route path="/items/:id" element={<ItemFormPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
