<template>
  <SidebarComponent/>
  <div class="product-list">
    <h1>Products</h1>
    <p>Total items displayed: {{ filteredProductPricings.length }}</p>
    <input type="text" v-model="searchQuery" placeholder="Search products..." class="search-bar"/>
    <ul>
      <li v-for="(pricing, index) in filteredProductPricings" :key="index" class="product-item">

      <div class="product-details">
          <div class="product-name">{{ pricing.product_name }}</div>
          <div class="product-price">actual price: {{ pricing.current_price }}PLN (as of {{
              pricing.scrape_date
            }})
          </div>
          <div class="provider"> company: {{ pricing.company_name }}</div>
          <div class="lowest-price"> lowest price available: {{ pricing.lowest_price }} -
            {{ pricing.lowest_price_date }}
          </div>
        </div>
        <div class="price-difference-indicator">
          <arrow-indicator :price-difference="pricing.current_price - pricing.lowest_price"></arrow-indicator>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import {ref, computed, onMounted} from 'vue';
import axios from 'axios';
import ArrowIndicator from "@/components/ArrowIndicator.vue";
import SidebarComponent from "@/components/SidebarComponenent.vue";

export default {
  components: {
    SidebarComponent,
    ArrowIndicator
  },

  setup() {
    const productPricings = ref([]);
    const searchQuery = ref('');

    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate() - 2).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    onMounted(async () => {
      try {
        const response = await axios.get('http://localhost:5000/productpricings');

        productPricings.value = response.data.productPricings
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

    const filteredProductPricings = computed(() => {
      const todayDate = getTodayDate();
      return productPricings.value
          .filter(pricing => pricing.product_name.toLowerCase().includes(searchQuery.value.toLowerCase()))
          .filter(pricing => pricing.scrape_date === todayDate);
    });

    return {
      productPricings,
      searchQuery,
      filteredProductPricings
    };
  }
}
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
  justify-content: space-between;
  display: flex;
  align-items: center;
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


.search-bar {
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

</style>