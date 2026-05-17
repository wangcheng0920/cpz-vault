<template>
  <div class="post-card-item">
    <div class="post-card-item__date">{{ post.date }}</div>
    <a :href="post.url" class="post-card-item__title">{{ post.title }}</a>
    <div class="post-card-item__excerpt">{{ post.excerpt }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { PostCard } from "../types";

defineProps<{
  post: PostCard;
}>();
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Rubik+Vinyl&display=swap");
.post-card-item {
  position: relative;
  padding-top: 48px;
  &__date {
    font-size: 64px;
    line-height: 1;
    opacity: 0.1;
    position: absolute;
    top: 0;
    left: 0;
    font-weight: bold;
    font-family: "Rubik Vinyl", sans-serif;
    font-weight: 400;
    font-style: italic;
    z-index: -1;
  }

  &__title {
    font-size: 20px;
    font-weight: bold;
    text-decoration: none !important;
  }

  &__excerpt {
    margin-top: 10px;
    font-size: 14px;
  }
}
</style>
