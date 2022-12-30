import { mount } from '@vue/test-utils';
import Cart from '@/Components/Cart';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';
import Vue from 'vue';

describe('Cart', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  const mountCart = () => {
    const products = server.createList('product', 2);
    const cartManager = new CartManager();

    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
      mocks: {
        $cart: cartManager,
      },
    });

    return { wrapper, products, cartManager };
  };

  it('should mount the component', async () => {
    const { wrapper } = mountCart();

    expect(wrapper.vm).toBeDefined();
  });

  it('should emit close event when button gets clicked', async () => {
    const { wrapper } = mountCart();

    const button = wrapper.find('[data-testid="close-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('should hide the cart when no props isOpen is passed', async () => {
    const { wrapper } = mountCart();

    expect(wrapper.classes()).toContain('hidden');
  });

  it('should display the cart when props isOpen is passed', async () => {
    const { wrapper } = mountCart();
    await wrapper.setProps({ isOpen: true });
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('should display the "Cart is empty" when there not products', async () => {
    const { wrapper } = mountCart();

    wrapper.setProps({
      products: [],
    });

    await Vue.nextTick();

    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('Should display 2 instances of cartItem when 2 products are provided', async () => {
    const products = server.createList('product', 2);

    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
    });

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  it('should display a button to clear cart', async () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="clear-cart-button"]');

    expect(button.exists()).toBe(true);
  });

  it('should cartManager clearCart() when button gets clicked', async () => {
    const { wrapper, cartManager, product } = mountCart();
    const spy = jest.spyOn(cartManager, 'clearCart');

    await wrapper.find('[data-testid="clear-cart-button"]').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
