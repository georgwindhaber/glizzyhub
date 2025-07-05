import { channels } from "../database/schema";

const apiKey = "AIzaSyDF4tS7MQhy70PBLHZk47FcZHwwtElTJGc";
const channelId = "UCtoaZpBnrd0lhycxYJ4MNOQ";

export default defineEventHandler(async (event) => {
  const channel = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=@AtriocClips&part=contentDetails`
  );

  const channelResults = await channel.json();

  console.log(channelResults.items[0].contentDetails);

  // const playlist = await fetch(
  //   `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${channelResults.items[0].contentDetails.relatedPlaylists.uploads}&part=snippet&maxResults=6`
  // );

  // const result = await playlist.json();

  const videosResult = await useDrizzle().select().from(channels);

  console.log(videosResult);

  return videosResult;
});
