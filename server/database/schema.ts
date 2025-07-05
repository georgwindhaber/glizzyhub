import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const channels = sqliteTable("channels", {
  channelId: integer("channel_id").primaryKey({ autoIncrement: true }),
  youtubeChannelId: text("youtube_channel_id").notNull().unique(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  smallThumbnailUrl: text("small_thumbnail_url"),
  mediumThumbnailUrl: text("medium_thumbnail_url"),
  highThumbnailUrl: text("high_thumbnail_url"),
  allVideosPlaylist: text("all_videos_playlist").notNull(),
  lastUpdatedAt: integer("last_updated_at", { mode: "timestamp" }),
});
