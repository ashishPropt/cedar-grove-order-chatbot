# Cedar Grove Order Chatbot — POC

A React chatbot for ordering from **Cedar Grove Cafe** and **Gianni's Pizzarama** (160 Stelton Rd, Piscataway NJ).

## Features

- Conversational chip-based UI — no typing needed
- Full menu: 250+ items across 26 categories, both restaurants
- Dynamic modifier questions (cheese type, egg style, wing sauce, crust, toppings, size, etc.)
- Multi-select toppings for pizza, calzone & stromboli
- Per-size pricing (pizza sizes, sub sizes, wing counts)
- Order cart — add multiple items before checkout
- Order summary with NJ tax (6.63%) and grand total

## Project structure

```
src/
  menuData.js              # Full menu data + price helpers
  App.jsx                  # Main chatbot state machine
  App.css
  index.js
  index.css
  components/
    Message.jsx            # Chat bubble (bot / user)
    Message.css
    ChipSelector.jsx       # Radio + multi-select chip UI
    ChipSelector.css
    OrderSummary.jsx       # Final receipt card
    OrderSummary.css
public/
  index.html
```

## Getting started

```bash
npm install
npm start
```

Opens at `http://localhost:3000`.

## Next steps (Supabase integration)

1. Add `.env` with your Supabase URL and anon key:
   ```
   REACT_APP_SUPABASE_URL=https://xxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Install the client: `npm install @supabase/supabase-js`
3. On order completion POST to `orders` + `order_items` + `order_item_modifiers` tables using the normalized schema.

## Tech

React 18 · Create React App · Plain CSS · No external UI libraries
