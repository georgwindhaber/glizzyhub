import { channels } from "../database/schema";
import { youtubeChannels } from "../utils/channels";
import { Channel } from "../utils/drizzle";

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

  const channelDbResult = await useDrizzle()
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
    })
    .returning();

  for (const channel of channelDbResult) {
    const playlist = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YOUTUBE_API_KEY}&playlistId=${channel.allVideosPlaylist}&part=id&maxResults=100`
    );

    console.log(await playlist.json());
  }

  return mappedChannelData;
};

export default defineEventHandler(async (event) => {
  console.log("Start seeding database...");
  const data = await seedYoutubeChannels();
  console.log("Finished seeding");

  return { seeding: "done", data };
});
