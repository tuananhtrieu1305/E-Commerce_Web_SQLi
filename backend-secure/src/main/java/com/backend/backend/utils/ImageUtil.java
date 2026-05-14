package com.backend.backend.utils;

import java.io.IOException;
import java.nio.file.*;
import java.util.Base64;
import java.util.UUID;

public class ImageUtil {

    private static final String UPLOAD_DIR = "uploads/";

    public static String saveImage(String base64Image) {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String fileName = UUID.randomUUID() + ".png";
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            byte[] imageBytes = Base64.getDecoder().decode(
                    base64Image.contains(",") ? base64Image.split(",")[1] : base64Image
            );
            Files.write(filePath, imageBytes);

            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error saving image", e);
        }
    }
}
