import { channels, videos } from "../database/schema";
import { desc, gte, lte, and } from "drizzle-orm";
import z from "zod";
import { PAGE_SIZE } from "~/utils/constants";

const querySchema = z.object({
  page: z.coerce.number().default(0),
  minLength: z.optional(z.coerce.number()),
  maxLength: z.optional(z.coerce.number()),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);

  const existingVideos = await useDrizzle()
    .select({
      title: videos.title,
      duration: videos.duration,
      views: videos.viewCount,
      publishedAt: videos.publishedAt,
      thumbnail: videos.mediumThumbnailUrl,
      youtubeVideoId: videos.youtubeVideoId,
      lastUpdatedAt: videos.lastUpdatedAt,
      channelName: channels.name,
      channelThumbnail: channels.smallThumbnailUrl,
      channelHandle: channels.handle,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.youtubeChannelId, channels.youtubeChannelId))
    .where(
      and(
        query.minLength
          ? gte(videos.durationInSeconds, query.minLength)
          : undefined,
        query.maxLength
          ? lte(videos.durationInSeconds, query.maxLength)
          : undefined
      )
    )
    .orderBy(desc(videos.publishedAt))
    .limit(PAGE_SIZE)
    .offset(query.page * PAGE_SIZE);

  return existingVideos;
});
