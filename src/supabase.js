import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default supabase;

/**
 * Save a completed order to Supabase.
 * Inserts into: orders -> order_items
 *
 * @param {Array}  cart      - Array of priced cart items from OrderSummary
 * @param {string} orderType - 'Pickup' | 'Delivery' | 'Dine in'
 * @returns {{ orderId: string, total: number }}
 */
export async function saveOrder(cart, orderType) {
  const TAX_RATE = 0.0663;
  const subtotal = cart.reduce((sum, i) => sum + i.price + i.modTotal, 0);
  const tax      = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total    = parseFloat((subtotal + tax).toFixed(2));

  // 1. Insert the order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      status:     'pending',
      order_type: orderType.toLowerCase().replace(' ', '_'),
      subtotal,
      tax,
      total,
    })
    .select('id')
    .single();

  if (orderError) throw new Error('Failed to create order: ' + orderError.message);

  const orderId = orderData.id;

  // 2. Insert order_items
  const items = cart.map(item => ({
    order_id:   orderId,
    item_name:  item.name,
    unit_price: item.price,
    mod_total:  item.modTotal,
    line_total: item.price + item.modTotal,
    quantity:   1,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items);

  if (itemsError) throw new Error('Failed to save order items: ' + itemsError.message);

  return { orderId, total };
}
