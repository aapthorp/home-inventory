package com.homeinventory.service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
public class StorageService {

    @Inject
    MinioClient minioClient;

    @ConfigProperty(name = "home-inventory.storage.bucket")
    String bucketName;

    void onStart(@Observes StartupEvent event) throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    /** Uploads the stream under the given object key. Caller owns key construction — see
     *  ItemAttachmentResource for the "{householdId}/{itemId}/{attachmentId}-{filename}" scheme. */
    public void upload(String objectKey, InputStream data, long size, String contentType) throws Exception {
        minioClient.putObject(PutObjectArgs.builder()
            .bucket(bucketName)
            .object(objectKey)
            .stream(data, size, -1)
            .contentType(contentType != null ? contentType : "application/octet-stream")
            .build());
    }

    /** Short-lived signed URL so clients fetch the file directly from MinIO rather than proxying
     *  bytes through Quarkus on every load. */
    public String getDownloadUrl(String objectKey) throws Exception {
        return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
            .bucket(bucketName)
            .object(objectKey)
            .method(Method.GET)
            .expiry(1, TimeUnit.HOURS)
            .build());
    }

    public void delete(String objectKey) throws Exception {
        minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectKey).build());
    }
}
