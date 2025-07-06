import { videos } from "../database/schema";

export const fetchVideoDetails = async (videoIds: Array<string>) => {
  const params = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY!,
    id: videoIds.join(","),
    part: "snippet,contentDetails,statistics",
  });

  return await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
  ).json();
};

export const upsertVideoDetails = async (videoIds: Array<string>) => {
  console.log("upsert videos", new Date().toISOString());

  const videoDetails = await fetchVideoDetails(videoIds);

  const mappedVideoDetails: Array<Omit<Videos, "videoId">> =
    videoDetails.items.map((video) => ({
      youtubeVideoId: video.id,
      youtubeChannelId: video.snippet.channelId,
      publishedAt: new Date(video.snippet.publishedAt),
      title: video.snippet.title,
      description: video.snippet.description,
      smallThumbnailUrl: video.snippet.thumbnails.default?.url,
      mediumThumbnailUrl: video.snippet.thumbnails.medium?.url,
      standardThumbnailUrl: video.snippet.thumbnails.standard?.url,
      highThumbnailUrl: video.snippet.thumbnails.high?.url,
      maxresThumbnailUrl: video.snippet.thumbnails.maxres?.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
      lastUpdatedAt: new Date(),
    }));

  return await useDrizzle()
    .insert(videos)
    .values(mappedVideoDetails)
    .onConflictDoUpdate({
      target: videos.youtubeVideoId,
      set: {
        publishedAt: sql`excluded.published_at`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        smallThumbnailUrl: sql`excluded.small_thumbnail_url`,
        mediumThumbnailUrl: sql`excluded.medium_thumbnail_url`,
        standardThumbnailUrl: sql`excluded.standard_thumbnail_url`,
        highThumbnailUrl: sql`excluded.high_thumbnail_url`,
        maxresThumbnailUrl: sql`excluded.maxres_thumbnail_url`,
        duration: sql`excluded.duration`,
        viewCount: sql`excluded.view_count`,
        likeCount: sql`excluded.like_count`,
        commentCount: sql`excluded.comment_count`,
        lastUpdatedAt: new Date(),
      },
    })
    .returning();
};
