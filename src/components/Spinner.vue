<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="spinner" :style="{ height: `${height}px` }">
    <div
      v-for="n in 5"
      :key="n"
      :class="`rect${n}`"
      :style="{ width: `${lineWidth}px` }"
    />
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      default: 40,
    },
    lineWidth: {
      type: Number,
      default: 6,
    },
  },
};
</script>

<style lang="stylus" scoped>
.spinner
  width: 50px
  height: 40px
  text-align: right
  font-size: 10px

.spinner
  > div
    background-color: #333
    height: 100%
    width: 6px
    display: inline-block
    margin-left: 2px
    animation: sk-stretchdelay 1.2s infinite ease-in-out

  .rect2
    animation-delay: -1.1s

  .rect3
    animation-delay: -1.0s

  .rect4
    animation-delay: -0.9s

  .rect5
    animation-delay: -0.8s

@keyframes sk-stretchdelay
  0%, 40%, 100%
    transform: scaleY(0.4)
  20%
    transform: scaleY(1.0)
</style>
