import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const videos = sqliteTable("videos", {
  videoId: integer("video_id").primaryKey({ autoIncrement: true }),
});
