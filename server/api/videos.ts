import { channels, videos } from "../database/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  return await useDrizzle()
    .select({
      title: videos.title,
      duration: videos.duration,
      views: videos.viewCount,
      publishedAt: videos.publishedAt,
      thumbnail: videos.mediumThumbnailUrl,
      youtubeVideoId: videos.youtubeVideoId,
      channelName: channels.name,
      channelThumbnail: channels.smallThumbnailUrl,
      channelHandle: channels.handle,
    })
    .from(videos)
    .leftJoin(channels, eq(videos.channelId, channels.channelId))
    .orderBy(desc(videos.publishedAt));
});
