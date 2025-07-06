import { channels, videos } from "../database/schema";
import { youtubeChannels } from "../utils/channels";
import { Channel, Videos } from "../utils/drizzle";
import { z } from "zod";

const seedSchema = z.object({
  type: z.enum(["channels", "videos"]),
});

export default defineEventHandler(async (event) => {
  console.log("Start seeding database...");

  const query = await getValidatedQuery(event, seedSchema.parse);

  const newData: any = {};

  if (query.type.includes("channels")) {
    newData.channels = await seedYoutubeChannels();
    console.log("Seeded channels");
  }

  if (query.type.includes("videos")) {
    newData.videos = await seedYoutubeVideos();
    console.log("Seeded videos");
  }

  console.log("Finished seeding");
  return newData;
});

const fetchVideoDetails = async (videoIds: Array<string>) => {
  const params = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY!,
    id: videoIds.join(","),
    part: "snippet,contentDetails,statistics",
  });

  return await (
    await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
  ).json();
};

const fetchVideosFromPlaylist = async (
  playlistId: string,
  channelId: number,
  pageToken?: string
) => {
  const params = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY!,
    playlistId: playlistId,
    part: "contentDetails",
    maxResults: "50",
    pageToken: pageToken || "",
  });

  const playlist = (await (
    await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
  ).json()) as {
    nextPageToken?: string;
    items: Array<{
      contentDetails: { videoId: string; videoPublishedAt: string };
    }>;
  };

  const videoDetails = (await fetchVideoDetails(
    playlist.items.map((item) => item.contentDetails.videoId)
  )) as any;

  const mappedVideoDetails: Array<Omit<Videos, "videoId">> =
    videoDetails.items.map((video) => ({
      youtubeVideoId: video.id,
      channelId,
      publishedAt: new Date(video.snippet.publishedAt),
      title: video.snippet.title,
      description: video.snippet.description,
      smallThumbnailUrl: video.snippet.thumbnails.default.url,
      mediumThumbnailUrl: video.snippet.thumbnails.medium.url,
      standardThumbnailUrl: video.snippet.thumbnails.standard.url,
      highThumbnailUrl: video.snippet.thumbnails.high.url,
      maxresThumbnailUrl: video.snippet.thumbnails.maxres?.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
      lastUpdatedAt: new Date(),
    }));

  await useDrizzle()
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
    });

  // if (playlist.nextPageToken) {
  //   await fetchVideosFromPlaylist(playlistId, playlist.nextPageToken);
  // }
};

export const seedYoutubeVideos = async () => {
  const existingChannels = await useDrizzle().select().from(channels);

  for (const channel of existingChannels) {
    const result = fetchVideosFromPlaylist(
      channel.allVideosPlaylist,
      channel.channelId
    );
  }
};

export const seedYoutubeChannels = async () => {
  const rawChannelData = [];

  for (const channel of youtubeChannels) {
    const channelContentDetails = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/channels?key=${process.env.YOUTUBE_API_KEY}&forHandle=${channel.handle}&part=snippet&part=contentDetails`
      )
    ).json();

    rawChannelData.push(channelContentDetails);
  }

  const mappedChannelData: Array<Omit<Channel, "channelId">> =
    rawChannelData.map((channel) => ({
      youtubeChannelId: channel.items[0].id,
      handle: channel.items[0].snippet.customUrl,
      description: channel.items[0].snippet.description,
      name: channel.items[0].snippet.title,
      smallThumbnailUrl: channel.items[0].snippet.thumbnails.default.url,
      mediumThumbnailUrl: channel.items[0].snippet.thumbnails.medium.url,
      highThumbnailUrl: channel.items[0].snippet.thumbnails.high.url,
      allVideosPlaylist:
        channel.items[0].contentDetails.relatedPlaylists.uploads,
      lastUpdatedAt: new Date(),
    }));

  await useDrizzle()
    .insert(channels)
    .values(mappedChannelData)
    .onConflictDoUpdate({
      target: channels.youtubeChannelId,
      set: {
        handle: sql`excluded.handle`,
        description: sql`excluded.description`,
        name: sql`excluded.name`,
        smallThumbnailUrl: sql`excluded.small_thumbnail_url`,
        mediumThumbnailUrl: sql`excluded.medium_thumbnail_url`,
        highThumbnailUrl: sql`excluded.high_thumbnail_url`,
        lastUpdatedAt: new Date(),
      },
    });

  return mappedChannelData;
};
