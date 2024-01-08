import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from "vue-router"

import productsView from "./components/ProductsLister.vue";
import ScrapingComponent from './components/ScrapingComponent.vue';


const routes = [
    { path: "/", component: productsView},
    { path: "/scraping", component: ScrapingComponent}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
