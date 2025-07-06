import { throttle } from "~/utils/throttle";
import { channels, videos } from "../database/schema";
import { desc } from "drizzle-orm";
import { upsertVideoDetails } from "../utils/videos";

const throtteledUpsertVideoDetails = throttle(
  upsertVideoDetails,
  "upsert-videos",
  120
);

export default defineEventHandler(async (event) => {
  const existingVideos = await useDrizzle()
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
    .leftJoin(channels, eq(videos.youtubeChannelId, channels.youtubeChannelId))
    .orderBy(desc(videos.publishedAt))
    .limit(50);

  const refreshedVideos = await throtteledUpsertVideoDetails(
    existingVideos.map((video) => video.youtubeVideoId)
  );

  return refreshedVideos || existingVideos;
});
