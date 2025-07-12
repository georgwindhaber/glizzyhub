<script setup lang="ts">
import type { VideoPreview } from "#imports";

const currentPage = ref(0);
const videos = ref<VideoPreview>([]);

const fetchVideos = async () => {
  const response = await $fetch("/api/videos", {
    query: { page: currentPage.value },
  });

  videos.value.push(...response);
};

const fetchMoreVideos = async () => {
  currentPage.value = currentPage.value + 1;

  await fetchVideos();
};

await fetchVideos();
</script>

<template>
  <main class="@container">
    <ul
      class="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-5 p-5"
    >
      <video-preview
        v-for="(video, index) of videos"
        :key="video.youtubeVideoId"
        :video="video"
        :is-lazy-load-observer="index > 0 && !(index % 45)"
        @lazy-load-triggered="fetchMoreVideos"
      />
    </ul>
  </main>
</template>
