import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ItemsStackParamList } from "@/navigation/RootNavigator";
import { useBarcodeLookup } from "@/api/barcode";

type Props = NativeStackScreenProps<ItemsStackParamList, "BarcodeScan">;

export default function BarcodeScanScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lookup = useBarcodeLookup();

  if (!permission) return <Centered><ActivityIndicator /></Centered>;
  if (!permission.granted) {
    return (
      <Centered>
        <Text style={styles.helper}>Camera access is needed to scan barcodes.</Text>
        <Text style={styles.link} onPress={requestPermission}>
          Grant permission
        </Text>
      </Centered>
    );
  }

  const handleScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const result = await lookup.mutateAsync(data);
      navigation.replace("ItemForm", {
        prefill: { barcode: data, brand: result.brand ?? undefined, name: result.name ?? undefined },
      });
    } catch {
      // Lookup failed (e.g. unknown barcode) — still let the user add the item manually.
      navigation.replace("ItemForm", { prefill: { barcode: data } });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"] }}
        onBarcodeScanned={scanned ? undefined : handleScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>
          {lookup.isPending ? "Looking up product…" : "Point the camera at a barcode"}
        </Text>
      </View>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  helper: { textAlign: "center", marginBottom: 12 },
  link: { color: "#1f6feb", fontWeight: "600" },
  overlay: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
  overlayText: { color: "#fff", backgroundColor: "#000a", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
});
