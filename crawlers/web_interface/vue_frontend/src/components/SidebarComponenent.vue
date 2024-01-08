<template>
  <div class="sidebar" @mouseover="toggleSidebar" @mouseleave="toggleSidebar">
    <a href="/"><span class="icon">🏠</span><span class="text">Products</span></a>
    <a href="/scraping"><span class="icon">🛍️</span><span class="text">Scraping</span></a>
  </div>

</template>


<script>
export default {
  data() {
    return {
      isSidebarExpanded: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
  },
};
</script>
<style>
.sidebar {
  height: 100%;
  width: 100px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  padding-top: 20px;
  transition: width 0.3s;

}

.sidebar:hover {
  width: 200px;
}

.sidebar a {
  padding: 10px 15px;
  text-decoration: none;
  font-size: 18px;
  color: #818181;
  display: flex;
  align-items: center;
  transition: 0.3s;
}

.sidebar .icon {
  display: block;
}

.sidebar a:hover {
  color: #f1f1f1;
}

.sidebar .text {
  display: none;
  margin-left: 10px;
}

.sidebar:hover .text {
  display: block;
}



</style>