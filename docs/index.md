---
title: My Blog
---

<script setup>
import { data as posts } from './posts.data.ts'

</script>
<ul>
  <li v-for="post of posts">
    <a :href="post.url">{{ post.title }}</a>
    <p>{{post.excerpt}}</p>
  </li>
</ul>
