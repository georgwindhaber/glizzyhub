<script setup lang="ts">
import type { VideoPreview } from "#imports";

useSeoMeta({
  description:
    "All your content from the Atrioc universe in one convenient place!",
  title: "Glizzyhub 🌭",
});

const videos = ref<VideoPreview>([]);

const query = ref({
  page: 0,
  minLength: null,
  maxLength: null,
});

const fetchVideos = async () => {
  const response = await $fetch("/api/videos", {
    query: {
      page: query.value.page,
      minLength: query.value.minLength || undefined,
      maxLength: query.value.maxLength || undefined,
    },
  });
  videos.value.push(...response);
};

const fetchMoreVideos = async () => {
  query.value.page = query.value.page + 1;

  await fetchVideos();
};

const applyFilter = async () => {
  videos.value = [];
  await fetchVideos();
};

await fetchVideos();
</script>

<template>
  <main class="">
    <section class="p-5 border-b-2 border-gray-100">
      Duration

      <input v-model="query.minLength" type="number" />
      <input v-model="query.maxLength" type="number" />

      <button
        class="px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium"
        @click="applyFilter"
      >
        Filter
      </button>
    </section>

    <section class="@container">
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
    </section>
  </main>
</template>
