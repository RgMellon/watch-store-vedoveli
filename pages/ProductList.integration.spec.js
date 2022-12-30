import { mount } from '@vue/test-utils';

import axios from 'axios';

import ProductList from '.';
import ProductCard from '@/components/ProductCard';
import Search from '@/components/Search';
import { makeServer } from '~/miragejs/server';
import Vue from 'vue';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('ProductList - integration', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  const getProductList = async (quantity = 10, overrides = []) => {
    let overrideList = [];

    if (overrides.length > 0) {
      overrideList = overrides.map((override) =>
        server.create('product', override)
      );
    }

    const products = [
      ...server.createList('product', quantity),
      ...overrideList,
    ];

    return products;
  };

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    const products = await getProductList(quantity, overrides);

    if (shouldReject) {
      axios.get.mockReturnValue(Promise.reject(new Error('')));
    } else {
      axios.get.mockReturnValue(Promise.resolve({ data: { products } }));
    }

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await Vue.nextTick();

    return { wrapper, products };
  };

  it('shoul mount the component', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the search component as a child', () => {
    const wrapper = mount(ProductList);
    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should mount the search component as a child', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should call axios.get on component mount', async () => {
    await mountProductList();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount the ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList();

    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(10);
  });

  it('shoul display the error message when Promise is rejected', async () => {
    axios.get.mockReturnValue(Promise.reject(new Error('')));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await Vue.nextTick();

    expect(wrapper.text()).toContain('Problema ao carregar a lista');
  });

  it('should filter the product list when search is performerd ', async () => {
    const { wrapper } = await mountProductList(10, [
      { title: 'Relogio 2' },
      { title: 'Relogio 1' },
    ]);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('Relogio');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(wrapper.vm.searchTerm).toEqual('Relogio');
    expect(cards).toHaveLength(2);
  });

  it('should filter the product list when search is cleaned ', async () => {
    const { wrapper } = await mountProductList(10, [{ title: 'Relogio 1' }]);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('Relogio');
    await search.find('form').trigger('submit');

    search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(wrapper.vm.searchTerm).toEqual('');
    expect(cards).toHaveLength(11);
  });

  it('should display the correct amount of products', async () => {
    const { wrapper } = await mountProductList(27);

    const label = wrapper.find('[data-testid="total-quantity-label"]');
    expect(label.text()).toEqual('27 Products');
  });

  it('should display product (singular) when there is only one product', async () => {
    const { wrapper } = await mountProductList(1);

    const label = wrapper.find('[data-testid="total-quantity-label"]');
    expect(label.text()).toEqual('1 Product');
  });
});
