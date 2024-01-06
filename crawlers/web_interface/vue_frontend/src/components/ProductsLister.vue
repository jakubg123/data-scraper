<template>
  <div class="product-list">
    <h1>Products</h1>
    <ul>
      <li v-for="product in products" :key="product.id">
        <h2>{{ product.name }}</h2>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const products = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/products');
    products.value = response.data.products;
  } catch (error) {
    console.error(error);
    // Handle errors appropriately
  }
});
</script>

<style>
/* Add styles for your product list here */
.product-list {
  /* styles */
}
.product-list h2 {
  /* styles for product name */
}
</style>