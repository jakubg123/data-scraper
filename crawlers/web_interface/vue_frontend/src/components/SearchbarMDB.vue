<template>
  <div class="search-box">
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Enter your search"
        class="search-input"
    />
    <button @click="submitSearch" class="search-button">Search</button>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import axios from 'axios'
export default {
  props: {
    initialQuery: String,
  },
  methods: {
    async submitSearch() {
      if (this.searchQuery) {
        try {
          const response = await axios.get(`http://localhost:5000/run?search=${encodeURIComponent(this.searchQuery)}`);
          console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    },
  },

  setup(props) {
    const searchQuery = ref(props.initialQuery || '');

    watch(() => props.initialQuery, (newQuery) => {
      searchQuery.value = newQuery.replaceAll('_',' ');
    });

    return {
      searchQuery,
    };
  },
};
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
}

.search-input {
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
}

.search-button {
  padding: 10px 15px;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}
</style>