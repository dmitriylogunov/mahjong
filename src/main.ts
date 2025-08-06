import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';
import App from './App.vue';
import './assets/styles/main.scss';

injectSpeedInsights();
inject();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');