import { channels, videos } from "../database/schema";

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
      channelThumbnail: channels.mediumThumbnailUrl,
    })
    .from(videos)
    .leftJoin(channels, eq(videos.channelId, channels.channelId));
});
