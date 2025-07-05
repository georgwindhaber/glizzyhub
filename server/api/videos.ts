const apiKey = "AIzaSyDF4tS7MQhy70PBLHZk47FcZHwwtElTJGc";
const channelId = "UCtoaZpBnrd0lhycxYJ4MNOQ";

export default defineEventHandler(async (event) => {
  const channel = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=@AtriocClips&part=contentDetails`
  );

  const channelResults = await channel.json();

  const playlist = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${channelResults.items[0].contentDetails.relatedPlaylists.uploads}&part=snippet&maxResults=6`
  );

  const result = await playlist.json();

  console.log(result, result.error, channelResults.items[0].contentDetails);

  return result;
});
