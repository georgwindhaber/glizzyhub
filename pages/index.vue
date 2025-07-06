<script setup lang="ts">
const videosData = await useFetch("/api/videos");
</script>

<template>
  <main class="@container">
    <ul
      class="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-5 p-5"
    >
      <video-preview
        v-for="video of videosData.data.value"
        :key="video.youtubeVideoId"
        :video="video"
      />
    </ul>
  </main>
</template>
