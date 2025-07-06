import { channels, videos } from "../database/schema";
import { youtubeChannels } from "../utils/channels";
import { Channel, Videos } from "../utils/drizzle";
import { z } from "zod";
import { upsertVideoDetails } from "../utils/videos";

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

const fetchVideosFromPlaylist = async (
  playlistId: string,
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

  const videoIds = playlist.items.map((item) => item.contentDetails.videoId);
  await upsertVideoDetails(videoIds);

  // if (playlist.nextPageToken) {
  //   await fetchVideosFromPlaylist(
  //     playlistId,
  //     playlist.nextPageToken
  //   );
  // }
};

export const seedYoutubeVideos = async () => {
  const existingChannels = await useDrizzle().select().from(channels);

  for (const channel of existingChannels) {
    fetchVideosFromPlaylist(channel.allVideosPlaylist);
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
