import React, { useState, useEffect, useRef } from 'react';
import Message from './components/Message';
import ChipSelector from './components/ChipSelector';
import OrderSummary from './components/OrderSummary';
import { MENU, getBasePrice, getSizeOptions } from './menuData';
import './App.css';

const STEPS = {
  RESTAURANT: 'restaurant',
  CATEGORY: 'category',
  ITEM: 'item',
  SIZE: 'size',
  MODIFIER: 'modifier',
  CONTINUE: 'continue',
  ORDER_TYPE: 'order_type',
  DONE: 'done',
};

function createBotMsg(text) { return { id: Date.now() + Math.random(), role: 'bot', text }; }
function createUserMsg(text) { return { id: Date.now() + Math.random(), role: 'user', text }; }

export default function App() {
  const [messages, setMessages] = useState([
    createBotMsg("Welcome to Cedar Grove Cafe & Gianni's Pizzarama! Which restaurant would you like to order from?"),
  ]);
  const [step, setStep] = useState(STEPS.RESTAURANT);
  const [chipsDisabled, setChipsDisabled] = useState(false);

  const [restaurant, setRestaurant] = useState(null);
  const [category, setCategory] = useState(null);
  const [item, setItem] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [sizeKey, setSizeKey] = useState(null);
  const [basePrice, setBasePrice] = useState(0);

  const [modKeys, setModKeys] = useState([]);
  const [modIdx, setModIdx] = useState(0);
  const [mods, setMods] = useState({});

  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState(null);

  const bottomRef = useRef(null);

  const addMsg = (msg) => setMessages(prev => [...prev, msg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lockChips = () => setChipsDisabled(true);
  const unlockChips = () => setChipsDisabled(false);

  const handleRestaurant = (r) => {
    lockChips();
    addMsg(createUserMsg(r));
    setRestaurant(r);
    setTimeout(() => {
      addMsg(createBotMsg('Which category are you interested in?'));
      setStep(STEPS.CATEGORY);
      unlockChips();
    }, 200);
  };

  const handleCategory = (cat) => {
    lockChips();
    addMsg(createUserMsg(cat));
    setCategory(cat);
    const data = MENU.items[cat];
    setItemData(data);
    setTimeout(() => {
      addMsg(createBotMsg('Which item would you like?'));
      setStep(STEPS.ITEM);
      unlockChips();
    }, 200);
  };

  const handleItem = (itm) => {
    lockChips();
    addMsg(createUserMsg(itm));
    setItem(itm);
    const data = MENU.items[category];
    const sizeOpts = getSizeOptions(category, itm);
    setTimeout(() => {
      if (sizeOpts && sizeOpts.length > 0) {
        addMsg(createBotMsg('What size would you like?'));
        setStep(STEPS.SIZE);
      } else {
        const price = getBasePrice(category, itm, null);
        setBasePrice(price);
        startModifiers(data);
      }
      unlockChips();
    }, 200);
  };

  const handleSize = (sz, price) => {
    lockChips();
    addMsg(createUserMsg(sz));
    setSizeKey(sz);
    const price2 = price !== undefined ? price : getBasePrice(category, item, sz);
    setBasePrice(price2);
    const data = MENU.items[category];
    setTimeout(() => {
      startModifiers(data);
      unlockChips();
    }, 200);
  };

  const startModifiers = (data) => {
    const keys = Object.keys((data || itemData || {}).modifiers || {});
    setModKeys(keys);
    setModIdx(0);
    setMods({});
    if (keys.length === 0) {
      addMsg(createBotMsg('Any special notes for this item? (tap Continue to skip)'));
      setStep(STEPS.CONTINUE);
    } else {
      const firstMod = (data || itemData).modifiers[keys[0]];
      addMsg(createBotMsg(firstMod.label + '?'));
      setStep(STEPS.MODIFIER);
    }
  };

  const handleModifier = (key, choices) => {
    lockChips();
    const data = itemData || MENU.items[category];
    const mod = data.modifiers[key];
    const choiceArr = Array.isArray(choices) ? choices : [choices];
    const displayText = choiceArr.length > 0 ? choiceArr.join(', ') : 'None';
    addMsg(createUserMsg(displayText));

    const newMod = {
      label: mod.label,
      choices: choiceArr
        .map(c => {
          const stripped = c.replace(/ \(\+\$[\d.]+\)/, '');
          const opt = mod.options.find(o => o[0] === stripped);
          return { name: stripped, cost: opt ? opt[1] : 0 };
        })
        .filter(c => c.name !== 'None'),
    };

    const updatedMods = { ...mods, [key]: newMod };
    setMods(updatedMods);

    const nextIdx = modIdx + 1;
    setModIdx(nextIdx);

    setTimeout(() => {
      if (nextIdx < modKeys.length) {
        const nextMod = data.modifiers[modKeys[nextIdx]];
        addMsg(createBotMsg(nextMod.label + '?'));
        unlockChips();
      } else {
        finalizeItem(updatedMods);
        unlockChips();
      }
    }, 200);
  };

  const finalizeItem = (finalMods) => {
    let modTotal = 0;
    const modSummary = [];
    Object.values(finalMods).forEach(m => {
      m.choices.forEach(c => {
        modSummary.push({ label: `${m.label}: ${c.name}`, cost: c.cost });
        modTotal += c.cost;
      });
    });

    const cartItem = {
      name: item + (sizeKey ? ` (${sizeKey})` : ''),
      category,
      price: basePrice,
      modTotal,
      modSummary,
    };

    setCart(prev => [...prev, cartItem]);
    const lineTotal = (basePrice + modTotal).toFixed(2);
    addMsg(createBotMsg(`Added: ${cartItem.name} — $${lineTotal}. Would you like to add another item?`));
    setStep(STEPS.CONTINUE);
  };

  const handleContinue = (choice) => {
    lockChips();
    addMsg(createUserMsg(choice));
    setTimeout(() => {
      if (choice === "Add another item") {
        setSizeKey(null);
        setItem(null);
        setBasePrice(0);
        addMsg(createBotMsg('Which restaurant?'));
        setStep(STEPS.RESTAURANT);
      } else {
        addMsg(createBotMsg('How would you like your order?'));
        setStep(STEPS.ORDER_TYPE);
      }
      unlockChips();
    }, 200);
  };

  const handleOrderType = (type) => {
    lockChips();
    addMsg(createUserMsg(type));
    setOrderType(type);
    setTimeout(() => {
      addMsg(createBotMsg("Here's your complete order summary:"));
      setStep(STEPS.DONE);
      unlockChips();
    }, 200);
  };

  const handleAddMore = () => {
    setSizeKey(null);
    setItem(null);
    setBasePrice(0);
    addMsg(createBotMsg('Which restaurant?'));
    setStep(STEPS.RESTAURANT);
  };

  const renderChips = () => {
    const data = itemData || MENU.items[category];

    switch (step) {
      case STEPS.RESTAURANT:
        return (
          <ChipSelector
            options={MENU.restaurants.map(r => [r, 0])}
            onSelect={(label) => handleRestaurant(label)}
            disabled={chipsDisabled}
          />
        );

      case STEPS.CATEGORY:
        return (
          <ChipSelector
            options={(MENU.categories[restaurant] || []).map(c => [c, 0])}
            onSelect={(label) => handleCategory(label)}
            disabled={chipsDisabled}
          />
        );

      case STEPS.ITEM:
        return (
          <ChipSelector
            options={(data?.items || []).map(i => [i, 0])}
            onSelect={(label) => handleItem(label)}
            disabled={chipsDisabled}
          />
        );

      case STEPS.SIZE: {
        const sizeOpts = getSizeOptions(category, item);
        if (!sizeOpts) return null;
        const sizeMap = {};
        if (data?.gourmetSizes) Object.entries(data.gourmetSizes).forEach(([k, v]) => (sizeMap[k] = v));
        else if (data?.pizzaSizes) Object.entries(data.pizzaSizes[item] || {}).forEach(([k, v]) => (sizeMap[k] = v));
        else if (data?.sizes && typeof data.sizes[item] === 'object') Object.entries(data.sizes[item]).forEach(([k, v]) => (sizeMap[k] = v));
        return (
          <ChipSelector
            options={sizeOpts.map(s => [s, sizeMap[s] || 0])}
            onSelect={(label, price) => handleSize(label, price)}
            disabled={chipsDisabled}
          />
        );
      }

      case STEPS.MODIFIER: {
        if (!data || modIdx >= modKeys.length) return null;
        const key = modKeys[modIdx];
        const mod = data.modifiers[key];
        return (
          <ChipSelector
            options={mod.options}
            onSelect={(label, price) => {
              if (mod.type === 'checkbox') {
                handleModifier(key, label);
              } else {
                handleModifier(key, label);
              }
            }}
            multi={mod.type === 'checkbox'}
            disabled={chipsDisabled}
          />
        );
      }

      case STEPS.CONTINUE:
        return (
          <ChipSelector
            options={[['Add another item', 0], ["That's my order", 0]]}
            onSelect={(label) => handleContinue(label)}
            disabled={chipsDisabled}
          />
        );

      case STEPS.ORDER_TYPE:
        return (
          <ChipSelector
            options={[['Pickup', 0], ['Delivery', 0], ['Dine in', 0]]}
            onSelect={(label) => handleOrderType(label)}
            disabled={chipsDisabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="chatwindow">
        <div className="chatwindow__header">
          <div className="chatwindow__avatar">CG</div>
          <div>
            <p className="chatwindow__name">Cedar Grove & Gianni's</p>
            <span className="chatwindow__sub">Order assistant</span>
          </div>
        </div>

        <div className="chatwindow__messages">
          {messages.map((msg) => (
            <Message key={msg.id} role={msg.role} text={msg.text} />
          ))}

          {step === STEPS.DONE && cart.length > 0 && (
            <OrderSummary cart={cart} orderType={orderType} onAddMore={handleAddMore} />
          )}

          {step !== STEPS.DONE && renderChips()}

          <div ref={bottomRef} />
        </div>

        <div className="chatwindow__footer">
          <input
            placeholder="Use the options above to order…"
            readOnly
            className="chatwindow__input"
          />
        </div>
      </div>
    </div>
  );
}
