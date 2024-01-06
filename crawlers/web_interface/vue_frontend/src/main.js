import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from "vue-router"

import productsView from "./components/ProductsLister.vue";
import ArrowIndicator from './components/ArrowIndicator.vue';


const routes = [
    { path: "/", component: productsView, ArrowIndicator},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
