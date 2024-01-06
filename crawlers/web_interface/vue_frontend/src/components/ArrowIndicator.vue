<template>
  <div class="arrow-indicator" :class="{'up': priceDifference > 0, 'down': priceDifference < 0}">
    <span v-if="priceDifference > 0">🔺</span>
    <span v-else-if="priceDifference < 0">🔻</span>
    <span v-else>-</span>
  </div>
</template>

<script>
export default {
  props: {
    priceDifference: Number
  }
}
</script>

<style>
.arrow-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.arrow-indicator.up {
  color: green;
}

.arrow-indicator.down {
  color: red;
}
</style>