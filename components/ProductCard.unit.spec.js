import { mount } from '@vue/test-utils';
import { cartState } from '@/state';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';

const mountProductCard = () => {
  const product = server.create('product', {
    title: 'Relógio bonito',
    price: '22.00',
  });

  const wrapper = mount(ProductCard, {
    propsData: {
      product,
    },
  });

  return {
    wrapper,
    product,
  };
};

describe('ProductCard - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountProductCard();

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('Relógio bonito');
    expect(wrapper.text()).toContain('$22.00');
  });

  it('should add item to cartState on button click', async () => {
    const { wrapper, product } = mountProductCard();
    await wrapper.find('button').trigger('click');

    expect(cartState.items).toHaveLength(1);
  });

  it.todo('should ensure product is not added to the cart twice');
});
