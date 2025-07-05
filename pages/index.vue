<script setup lang="ts">
import { parse } from "iso8601-duration";
const videosData = await useFetch("/api/videos");
</script>

<template>
  <main>
    <ul class="grid grid-cols-4 gap-5 p-5">
      <li
        v-for="video of videosData.data.value"
        :key="video.youtubeVideoId"
        class="flex flex-col gap-2"
      >
        <div class="relative">
          <img
            :src="video.thumbnail"
            :alt="video.title"
            class="rounded-xl w-full"
          />
          <div
            class="bg-gray-900/90 text-white absolute bottom-2 right-2 rounded px-2"
          >
            {{ durationFormat(video.duration) }}
          </div>
        </div>
        <div class="flex gap-2">
          <div>
            <img :src="video.channelThumbnail" class="rounded-full size-12" />
          </div>
          <div class="flex flex-col">
            <div class="font-bold">
              {{ video.title }}
            </div>
            <div class="flex flex-col text-gray-800">
              <div>
                {{ video.channelName }}
              </div>
              <div>
                {{ video.publishedAt }}
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </main>
</template>
