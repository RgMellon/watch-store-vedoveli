<template>
  <main class="my-8">
    <search @doSearch="setSearchTerm" />
    <div class="container mx-auto px-6" v-if="errorMessage === ''">
      <h3 class="text-gray-700 text-2xl font-medium">Wrist Watch</h3>
      <span
        data-testid="total-quantity-label"
        lass="mt-3 text-sm text-gray-500"
        >{{ quantityLabel }}</span
      >
      >
      <div
        class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6"
      >
        <product-card
          v-for="product in list"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
    <h3 v-else class="text-center text-2xl">{{ errorMessage }}</h3>
  </main>
</template>

<script>
import ProductCard from '@/components/ProductCard';
import Search from '@/components/Search';

export default {
  name: 'ProductList',
  components: { ProductCard, Search },

  data() {
    return {
      products: [],
      errorMessage: '',
      searchTerm: '',
    };
  },

  computed: {
    list() {
      if (this.searchTerm !== '') {
        return this.products.filter(({ title }) => {
          return title.includes(this.searchTerm);
        });
      }
      return this.products;
    },

    quantityLabel() {
      if (this.list.length > 1) {
        return `${this.list.length} Products`;
      }
      return `${this.list.length} Product`;
    },
  },

  async created() {
    try {
      const response = await this.$axios.get('/api/products');
      this.products = response.data.products;
      this.isLoading = false;
    } catch (err) {
      this.errorMessage = 'Problema ao carregar a lista';
    }
  },

  methods: {
    setSearchTerm({ term }) {
      this.searchTerm = term;
    },
  },
};
</script>
