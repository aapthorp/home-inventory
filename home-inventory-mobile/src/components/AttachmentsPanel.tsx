import React, { useState } from "react";
import { View, Text, Image, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAttachments, useUploadAttachment, useUpdateAttachment, useDeleteAttachment } from "@/api/attachments";
import type { AttachmentType, UUID } from "@/types/inventory";

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPanel({ itemId }: { itemId: UUID }) {
  const { data: attachments, isLoading } = useAttachments(itemId);
  const upload = useUploadAttachment(itemId);
  const update = useUpdateAttachment(itemId);
  const remove = useDeleteAttachment(itemId);

  const [pendingType] = useState<AttachmentType>("PHOTO");

  async function pickAndUpload(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", fromCamera ? "Camera access is needed to take a photo." : "Photo library access is needed.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];

    upload.mutate(
      {
        file: { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType },
        type: pendingType,
        label: null,
      },
      {
        onError: (error) => {
          console.error("Attachment upload failed:", error);
          Alert.alert("Upload failed", "Check your connection and try again.");
        },
      }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Photos & attachments</Text>

      <View style={styles.uploadRow}>
        <Pressable style={styles.uploadButton} onPress={() => pickAndUpload(true)} disabled={upload.isPending}>
          <Text style={styles.uploadButtonText}>Take photo</Text>
        </Pressable>
        <Pressable style={styles.uploadButton} onPress={() => pickAndUpload(false)} disabled={upload.isPending}>
          <Text style={styles.uploadButtonText}>Choose from library</Text>
        </Pressable>
      </View>

      {upload.isPending && <ActivityIndicator style={{ marginVertical: 8 }} />}
      {isLoading && <Text style={styles.helperText}>Loading…</Text>}
      {!isLoading && attachments?.length === 0 && <Text style={styles.helperText}>No attachments yet.</Text>}

      <View style={styles.grid}>
        {attachments?.map((attachment) => (
          <View key={attachment.id} style={styles.card}>
            {attachment.contentType?.startsWith("image/") && attachment.downloadUrl ? (
              <Image source={{ uri: attachment.downloadUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbFile]}>
                <Text style={styles.thumbFileText}>{attachment.type.replace("_", " ")}</Text>
              </View>
            )}
            <TextInput
              style={styles.labelInput}
              placeholder="Add a label…"
              defaultValue={attachment.label ?? ""}
              onEndEditing={(e) =>
                update.mutate({ attachmentId: attachment.id, payload: { label: e.nativeEvent.text } })
              }
            />
            <Text style={styles.meta}>{formatSize(attachment.sizeBytes)}</Text>
            <Pressable
              onPress={() =>
                Alert.alert("Delete attachment?", undefined, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => remove.mutate(attachment.id) },
                ])
              }
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#333", textTransform: "uppercase", marginBottom: 10 },
  uploadRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  uploadButton: {
    flex: 1,
    backgroundColor: "#f0f4fa",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  uploadButtonText: { color: "#1f6feb", fontWeight: "600", fontSize: 13 },
  helperText: { color: "#888", fontSize: 13, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: 140, borderWidth: 1, borderColor: "#eee", borderRadius: 8, padding: 8 },
  thumb: { width: "100%", height: 100, borderRadius: 6, backgroundColor: "#eee" },
  thumbFile: { alignItems: "center", justifyContent: "center" },
  thumbFileText: { fontSize: 11, color: "#888", textTransform: "uppercase" },
  labelInput: { fontSize: 12, borderBottomWidth: 1, borderBottomColor: "#eee", marginTop: 6, paddingVertical: 2 },
  meta: { fontSize: 11, color: "#999", marginTop: 4 },
  deleteText: { fontSize: 12, color: "#d1453b", marginTop: 4 },
});
