<template>
  <ul class="post-card-list">
    <li v-for="post of posts" :key="post.url">
      <PostCardItem :post="post" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import PostCardItem from "./post-card-item.vue";
import type { PostCard } from "../types";

defineProps<{
  posts: PostCard[];
}>();
</script>

<style lang="scss">
ul.post-card-list {
  list-style: none;
  padding: 0;
  margin: 0;

  & > li:not(:last-child) {
    margin-bottom: 24px;
  }
}
</style>
