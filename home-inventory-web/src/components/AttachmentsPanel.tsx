import React, { useRef, useState } from "react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<AttachmentType>("PHOTO");
  const [pendingLabel, setPendingLabel] = useState("");

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { file, type: pendingType, label: pendingLabel || null },
      {
        onSuccess: () => setPendingLabel(""),
        onError: (error) => {
          console.error("Attachment upload failed:", error);
          alert("Upload failed — check the console for details.");
        },
      }
    );
    e.target.value = "";
  }

  return (
    <div className="form-field form-field-wide">
      <span>Attachments</span>

      <div className="attachment-upload-row">
        <select className="select" value={pendingType} onChange={(e) => setPendingType(e.target.value as AttachmentType)}>
          <option value="PHOTO">Photo</option>
          <option value="RECEIPT">Receipt</option>
          <option value="MANUAL">Manual</option>
          <option value="WARRANTY_DOC">Warranty doc</option>
        </select>
        <input
          className="input"
          placeholder="Label (optional) — e.g. Front, Serial plate…"
          value={pendingLabel}
          onChange={(e) => setPendingLabel(e.target.value)}
        />
        <button type="button" className="button-secondary" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? "Uploading…" : "Choose file…"}
        </button>
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChosen} accept="image/*,.pdf" />
      </div>

      {isLoading && <p className="helper-text">Loading attachments…</p>}
      {!isLoading && attachments?.length === 0 && <p className="helper-text">No attachments yet.</p>}

      {attachments && attachments.length > 0 && (
        <div className="attachment-grid">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-card">
              {attachment.contentType?.startsWith("image/") && attachment.downloadUrl ? (
                <img src={attachment.downloadUrl} alt={attachment.label ?? attachment.type} className="attachment-thumb" />
              ) : (
                <div className="attachment-thumb attachment-thumb-file">{attachment.type.replace("_", " ")}</div>
              )}
              <input
                className="input attachment-label-input"
                value={attachment.label ?? ""}
                placeholder="Add a label…"
                onChange={(e) => update.mutate({ attachmentId: attachment.id, payload: { label: e.target.value } })}
              />
              <div className="attachment-meta">
                {formatSize(attachment.sizeBytes)}
                {attachment.downloadUrl && (
                  <>
                    {" · "}
                    <a href={attachment.downloadUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </>
                )}
              </div>
              <button
                type="button"
                className="link-button link-button-danger"
                onClick={() => {
                  if (confirm("Delete this attachment?")) remove.mutate(attachment.id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
