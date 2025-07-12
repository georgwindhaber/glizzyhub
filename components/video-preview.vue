<script setup lang="ts">
const props = defineProps<{
  video: {
    youtubeVideoId: string;
    thumbnail: string;
    title: string;
    duration: string;
    channelHandle: string;
    channelThumbnail: string;
    channelName: string;
    views: number;
    publishedAt: string;
  };
  isLazyLoadObserver?: boolean;
}>();

const emit = defineEmits<{
  (e: "lazy-load-triggered"): void;
}>();

const observer = ref<IntersectionObserver | null>(null);
const element = useTemplateRef("root");

onMounted(() => {
  if (props.isLazyLoadObserver) {
    observer.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            emit("lazy-load-triggered");
            observer.value?.disconnect();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (element.value) {
      observer.value.observe(element.value);
    } else {
      console.warn("Could not start lazy load - html element not found");
    }
  }
});

onUnmounted(() => {
  observer.value?.disconnect();
});
</script>

<template>
  <li
    :key="video.youtubeVideoId"
    class="flex flex-col gap-2 rounded-xl"
    ref="root"
  >
    <nuxt-link
      class="relative"
      :href="`https://youtube.com/watch?v=${video.youtubeVideoId}`"
      target="_blank"
    >
      <img
        :src="video.thumbnail"
        :alt="video.title"
        class="rounded-xl w-full"
      />
      <div
        class="bg-gray-900/90 text-white absolute bottom-2 right-2 rounded px-2"
      >
        {{ formatDuration(video.duration) }}
      </div>
    </nuxt-link>

    <div class="flex gap-2">
      <div class="w-fit">
        <nuxt-link
          class="relative"
          :href="`https://youtube.com/${video.channelHandle}`"
          target="_blank"
        >
          <img :src="video.channelThumbnail" class="rounded-full size-12" />
        </nuxt-link>
      </div>

      <div class="flex flex-col flex-1">
        <nuxt-link
          class="font-bold text-lg"
          :href="`https://youtube.com/watch?v=${video.youtubeVideoId}`"
          target="_blank"
        >
          {{ video.title }}
        </nuxt-link>
        <div class="flex flex-col text-gray-700">
          <div>
            <nuxt-link
              class="hover:text-black"
              :href="`https://youtube.com/${video.channelHandle}`"
              target="_blank"
            >
              {{ video.channelName }}
            </nuxt-link>
          </div>
          <div>
            {{ formatViews(video.views) }} views -
            {{ new Date(video.publishedAt).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </li>
</template>
