---
title: My Blog
---

<script setup>
import { data as posts } from './posts.data.ts'
import PostCardList from './comps/post-card-list.vue'

</script>
<PostCardList :posts="posts" />
