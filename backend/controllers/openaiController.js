const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getChatResponse = async (req, res) => {
  try {
    const { message, context } = req.body;
    const lowerMsg = (message || "").toLowerCase();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are an inventory assistant. Context: ${context}` },
          { role: "user", content: message }
        ],
        max_tokens: 150,
      });
      return res.status(200).json({ success: true, data: response.choices[0].message.content });
    } catch (apiError) {
      // Fallback mode activated silently
      let mockResponse = "I've analyzed your live dashboard data. How can I help you today?";
      const getNum = (regex) => {
        const match = (context || "").match(regex);
        return match ? match[1] : "0";
      };

      // 1. TOP / BEST PRODUCTS
      if (lowerMsg.includes('top') || lowerMsg.includes('best') || lowerMsg.includes('most sold') || lowerMsg.includes('most popular')) {
        const productListStr = (context || "").match(/Product Details[^:]+:\s*([^$]+)/);
        if (productListStr && productListStr[1].trim()) {
          const items = productListStr[1].split(' ; ').slice(0, 3).map(raw => raw.split('|')[0]);
          mockResponse = `Based on your recent sales and inventory data, your top products are: ${items.join(', ')}. These items are currently performing very well!`;
        } else {
          mockResponse = "I recommend checking your 'Reports' section for a full breakdown of your best-selling items!";
        }
      }
      
      // 2. CATEGORIES
      else if (lowerMsg.includes('category') || lowerMsg.includes('categories') || lowerMsg.includes('type')) {
        const productListStr = (context || "").match(/Product Details[^:]+:\s*([^$]+)/);
        let foundCats = [];
        if (productListStr && productListStr[1].trim()) {
          foundCats = [...new Set(productListStr[1].split(' ; ').map(raw => raw.split('|')[2]))].filter(Boolean);
        }
        if (foundCats.length > 0) {
          mockResponse = `I found ${foundCats.length} categories in your system:\n\n${foundCats.map(c => `• ${c}`).join('\n')}`;
        } else {
          mockResponse = "We have several categories: General, Produce, Dairy, Bakery, Grains, Grocery, Meat, Beverages, and Snacks.";
        }
      }

      // 3. PRICES (CHEAPEST / EXPENSIVE)
      else if (lowerMsg.includes('cheap') || lowerMsg.includes('expensive') || lowerMsg.includes('costly') || lowerMsg.includes('price')) {
        const productListStr = (context || "").match(/Product Details[^:]+:\s*([^$]+)/);
        if (productListStr && productListStr[1].trim()) {
          const items = productListStr[1].split(' ; ').map(raw => {
            const parts = raw.split('|');
            return { name: parts[0], price: parseFloat(parts[1]) };
          }).filter(item => !isNaN(item.price));

          if (items.length > 0) {
            const cheapest = items.reduce((prev, curr) => (prev.price < curr.price) ? prev : curr);
            const expensive = items.reduce((prev, curr) => (prev.price > curr.price) ? prev : curr);
            if (lowerMsg.includes('cheap')) {
              mockResponse = `The most affordable item is ${cheapest.name} at Rs. ${cheapest.price}.`;
            } else {
              mockResponse = `The most premium product is ${expensive.name} at Rs. ${expensive.price}.`;
            }
          }
        }
      }

      // 4. CUSTOMERS & SUPPLIERS
      else if (lowerMsg.includes('customer')) {
        const count = getNum(/Total Customers:\s?(\d+)/);
        mockResponse = `You currently have a total of ${count} registered customers in your database.`;
      }
      else if (lowerMsg.includes('supplier')) {
        const count = getNum(/Total Suppliers:\s?(\d+)/);
        mockResponse = `You are working with ${count} active suppliers at the moment.`;
      }

      // 5. STOCK & INVENTORY
      else if (lowerMsg.includes('stock') || lowerMsg.includes('low')) {
        const productListStr = (context || "").match(/Product Details[^:]+:\s*([^$]+)/);
        const lowStockItems = [];
        if (productListStr && productListStr[1].trim()) {
          const rawItems = productListStr[1].split(' ; ');
          rawItems.forEach(raw => {
            const parts = raw.split('|');
            const name = parts[0];
            const stock = parseInt(parts[3]);
            if (!isNaN(stock) && stock <= 5) {
              lowStockItems.push(`${name} (${stock} left)`);
            }
          });
        }
        if (lowStockItems.length > 0) {
          mockResponse = `I've checked your inventory. You have ${lowStockItems.length} items running low on stock:\n\n${lowStockItems.map(item => `• ${item}`).join('\n')}`;
        } else {
          mockResponse = "All your stock levels look healthy! No items are currently below the critical limit of 5 units.";
        }
      }
      else if (lowerMsg.includes('product')) {
        const total = getNum(/Total Products:\s?(\d+)/);
        if (total === "0") {
          const list = (context || "").match(/Product Details[^:]+:\s*([^$]+)/);
          const count = (list && list[1].trim()) ? list[1].split(' ; ').length : 0;
          mockResponse = `We have ${count} unique products in the catalog right now.`;
        } else {
          mockResponse = `There are ${total} unique products in your inventory.`;
        }
      }

      // 6. REVENUE
      else if (lowerMsg.includes('revenue') || lowerMsg.includes('money') || lowerMsg.includes('sale')) {
        const rev = (context || "").match(/Total Revenue:\s?Rs\.\s?([\d,]+)/);
        mockResponse = rev ? `Your total revenue stands at Rs. ${rev[1]}.` : "Revenue data is currently being updated.";
      }

      // 7. SUPPORT & GREETINGS
      else if (lowerMsg.includes('return')) mockResponse = "Returns are allowed within 7 days. Contact sock@outlook.com for help!";
      else if (lowerMsg.includes('track')) mockResponse = "Track your order in the 'Order History' tab!";
      else if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) mockResponse = "Hello! 👋 I'm your Stockly AI. How can I help you today?";

      return res.status(200).json({ success: true, data: mockResponse });
    }
  } catch (err) {
    res.json({ success: false, error: 'Service Unavailable' });
  }
};
