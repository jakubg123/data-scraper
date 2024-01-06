<template>
  <div>
    <h1>Products</h1>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: []
    };
  },
  mounted() {
    axios.get('http://localhost:5000/products')
        .then(response => {
          this.products = response.data.products;
        })
        .catch(error => console.error(error));
  }
};
</script>