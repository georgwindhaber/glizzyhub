import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const channels = sqliteTable("channels", {
  youtubeChannelId: text("youtube_channel_id").primaryKey(),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  smallThumbnailUrl: text("small_thumbnail_url"),
  mediumThumbnailUrl: text("medium_thumbnail_url"),
  highThumbnailUrl: text("high_thumbnail_url"),
  allVideosPlaylist: text("all_videos_playlist").notNull(),
  lastUpdatedAt: integer("last_updated_at", { mode: "timestamp" }),
});

export const videos = sqliteTable("videos", {
  youtubeVideoId: text("youtube_video_id").primaryKey(),
  youtubeChannelId: integer("youtube_channel_id").references(
    () => channels.youtubeChannelId
  ),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  title: text("title").notNull(),
  description: text("description"),
  smallThumbnailUrl: text("small_thumbnail_url"),
  mediumThumbnailUrl: text("medium_thumbnail_url"),
  highThumbnailUrl: text("high_thumbnail_url"),
  standardThumbnailUrl: text("standard_thumbnail_url"),
  maxresThumbnailUrl: text("maxres_thumbnail_url"),
  duration: text("duration"),
  viewCount: integer("view_count"),
  likeCount: integer("like_count"),
  commentCount: integer("comment_count"),
  lastUpdatedAt: integer("last_updated_at", { mode: "timestamp" }),
});
