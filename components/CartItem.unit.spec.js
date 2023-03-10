import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';
import CartItem from '@/components/CartItem';

const mountCartItem = () => {
  const cartManager = new CartManager();

  const product = server.create('product', {
    title: 'relogio legal',
    price: '22.33',
  });

  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  });

  return { product, wrapper, cartManager };
};

describe('CartItem', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', async () => {
    const { wrapper } = mountCartItem();

    expect(wrapper.vm).toBeDefined();
  });

  it('should display the product info', () => {
    const {
      wrapper,
      product: { title, price },
    } = mountCartItem();

    const content = wrapper.text();

    expect(content).toContain(title);
    expect(content).toContain(price);
  });

  it('should diplay the quantity 1 when product is first displayed', async () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toContain('1');
  });

  it('should increase quantity when the button + gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="+"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('2');

    await button.trigger('click');
    expect(quantity.text()).toContain('3');

    await button.trigger('click');
    expect(quantity.text()).toContain('4');
  });

  it('should decrease quantity when the button - gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="-"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  it('should not go bellow zero when the button - is repeatedly clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="-"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  it('should display a button to remove item from cart', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="remove-button"]');

    expect(button.exists()).toBe(true);
  });

  it('should cartManager removeProduct() when button gets clicked', async () => {
    const { wrapper, cartManager, product } = mountCartItem();
    const spy = jest.spyOn(cartManager, 'removeProduct');

    await wrapper.find('[data-testid="remove-button"]').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(product.id);
  });
});
