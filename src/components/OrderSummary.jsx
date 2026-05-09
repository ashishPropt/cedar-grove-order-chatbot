import React from 'react';
import './OrderSummary.css';

const TAX_RATE = 0.0663;

export default function OrderSummary({ cart, orderType, onAddMore }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price + item.modTotal, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="order-summary">
      <h3 className="order-summary__title">Your order</h3>

      {cart.map((item, i) => {
        const lineTotal = item.price + item.modTotal;
        return (
          <div key={i} className="order-summary__item">
            <div className="order-summary__item-header">
              <span className="order-summary__item-name">
                {i + 1}. {item.name}
              </span>
              <span className="order-summary__item-price">${item.price.toFixed(2)}</span>
            </div>
            {item.modSummary.map((m, j) => (
              <div key={j} className="order-summary__mod">
                <span>{m.label}</span>
                {m.cost > 0 && <span>+${m.cost.toFixed(2)}</span>}
              </div>
            ))}
            <div className="order-summary__line-total">
              Line total: ${lineTotal.toFixed(2)}
            </div>
          </div>
        );
      })}

      <div className="order-summary__divider" />

      <div className="order-summary__row">
        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="order-summary__row order-summary__row--muted">
        <span>Tax (6.63% NJ)</span><span>${tax.toFixed(2)}</span>
      </div>
      <div className="order-summary__row order-summary__row--total">
        <span>Total</span><span>${total.toFixed(2)}</span>
      </div>
      <div className="order-summary__row order-summary__row--muted" style={{ marginTop: 6, fontSize: 12 }}>
        <span>Order type</span><span>{orderType}</span>
      </div>

      <button className="order-summary__add-btn" onClick={onAddMore}>
        + Add another item
      </button>
    </div>
  );
}
