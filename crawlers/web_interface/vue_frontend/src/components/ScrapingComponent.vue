<template>
  <SidebarComponent/>
  <div class="collection-container">
    <h2>Collections</h2>
    <ul class="collection-list">
      <li v-for="collection in collections" :key="collection" class="collection-item" @click="setSearchQuery(collection)">
        {{ collection }}
      </li>
    </ul>

  </div>

  <SearchbarMDB :initialQuery="currentSearchQuery" @updateSearch="updateSearchQuery"/>



</template>

<script>
import axios from 'axios';
import SidebarComponent from "@/components/SidebarComponenent.vue";
import SearchbarMDB from "@/components/SearchbarMDB.vue";

export default {
  components: {
    SearchbarMDB,
    SidebarComponent,
  },
  data() {
    return {
      collections: [],
      currentSearchQuery: '',
    };
  },
  mounted() {
    this.getCollections();
  },
  methods: {
    getCollections() {
      axios.get('http://localhost:5000/get_collections')
          .then(response => {
            this.collections = response.data;
          })
          .catch(error => {
            console.error('There was an error fetching the collections:', error);
          });
    },
    setSearchQuery(collectionName) {
      this.currentSearchQuery = collectionName;
    },
    updateSearchQuery(newQuery) {
      this.currentSearchQuery = newQuery;
    },
  }
};
</script>

<style scoped>
.collection-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.collection-list {
  list-style-type: none;
  padding: 0;
}

.collection-item {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.collection-item:hover {
  background-color: #e9e9e9;
}

h2 {
  color: #333;
  font-family: 'Arial', sans-serif;
}

.search-bar-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #f8f8f8;
  padding: 10px;
  box-sizing: border-box;
  border-top: 1px solid #ddd;
}

.search-textarea {
  width: 100%;
  resize: none;
  border: 0;
  background-color: transparent;
  padding: 10px 55px;
  border-radius: 5px;
  max-height: 200px;
  height: 52px;
  overflow-y: hidden;
  font-size: 16px;
  color: #333;
  placeholder-color: #666;
}

</style>