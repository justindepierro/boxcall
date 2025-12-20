import { supabase } from "../lib/supabase";
import { warn } from "../utils/logger";

export class ThumbnailUploadService {
  /**
   * Upload a thumbnail data URL to Supabase Storage and return its public URL.
   * Falls back to returning the original data URL if upload fails.
   */
  static async uploadPlayThumbnail(
    playId: string,
    dataUrl: string
  ): Promise<string> {
    try {
      // Convert data URL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const path = `thumbnails/${playId}-${Date.now()}.png`;
      const { error } = await supabase.storage
        .from("play-assets")
        .upload(path, blob, {
          cacheControl: "31536000",
          upsert: true,
          contentType: "image/png",
        });
      if (error) throw error;
      const { data } = supabase.storage.from("play-assets").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      warn("Thumbnail upload failed; using data URL", e);
      return dataUrl; // graceful fallback
    }
  }
}
