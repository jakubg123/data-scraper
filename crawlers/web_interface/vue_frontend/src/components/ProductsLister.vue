<template>
  <div class="product-list">
    <h1>Products</h1>
    <input type="text" v-model="searchQuery" placeholder="Search products..." class="search-bar" />
    <ul>
      <li v-for="pricing in productPricings" :key="pricing.product_name" class="product-item">
        <div class="product-name">{{ pricing.product_name }}</div>
        <div class="product-price">{{ pricing.price }} (as of {{ pricing.scrape_date }})</div>
        <div class="provider">{{pricing.company_name}}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { format } from 'date-fns';

const productPricings = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/productpricings');
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');

    productPricings.value = response.data.productPricings
        .filter(pricing => pricing.scrape_date === today || pricing.scrape_date === yesterday)
        .map(pricing => ({
          ...pricing,
          price: parseFloat(pricing.price)
        }))
        .sort((a, b) => {
          if (a.product_name < b.product_name) return -1;
          if (a.product_name > b.product_name) return 1;

          return a.price - b.price;
        });
  } catch (error) {
    console.error(error);
  }
});
</script>

<style>
.product-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-list h1 {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.product-list ul {
  list-style: none;
  padding: 0;
}

.product-item {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.product-name {
  font-size: 18px;
  color: #555;
  margin: 0;
}

.product-price {
  font-size: 16px;
  color: #888;
}
.search-bar {
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

</style>