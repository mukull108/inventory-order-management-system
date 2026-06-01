import { useEffect, useState } from "react";

import { api } from "./api";

const initialProduct = {
  sku: "",
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
};

const initialCustomer = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const initialOrder = {
  customer_id: "",
  product_id: "",
  quantity: "",
};

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(initialProduct);
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [orderForm, setOrderForm] = useState(initialOrder);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [productData, customerData, orderData] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getOrders(),
      ]);
      setProducts(productData);
      setCustomers(customerData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(setter) {
    return (event) => {
      const { name, value } = event.target;
      setter((current) => ({ ...current, [name]: value }));
    };
  }

  async function submitProduct(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createProduct({
        ...productForm,
        price: Number(productForm.price),
        stock_quantity: Number(productForm.stock_quantity),
      });
      setProductForm(initialProduct);
      setSuccess("Product created.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitCustomer(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createCustomer(customerForm);
      setCustomerForm(initialCustomer);
      setSuccess("Customer created.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.createOrder({
        customer_id: Number(orderForm.customer_id),
        items: [
          {
            product_id: Number(orderForm.product_id),
            quantity: Number(orderForm.quantity),
          },
        ],
      });
      setOrderForm(initialOrder);
      setSuccess("Order placed and inventory updated.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Ethara.ai Assessment</p>
          <h1>Inventory & Order Management System</h1>
          <p className="hero-copy">
            Manage products, customers, and orders from one responsive dashboard with real-time stock visibility.
          </p>
        </div>
        <div className="hero-stat-grid">
          <article>
            <span>Products</span>
            <strong>{products.length}</strong>
          </article>
          <article>
            <span>Customers</span>
            <strong>{customers.length}</strong>
          </article>
          <article>
            <span>Orders</span>
            <strong>{orders.length}</strong>
          </article>
        </div>
      </header>

      {(error || success) && (
        <section className={`flash ${error ? "flash-error" : "flash-success"}`}>
          {error || success}
        </section>
      )}

      <main className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Add Product</h2>
            <p>Unique SKU and stock-aware catalog items.</p>
          </div>
          <form className="form-grid" onSubmit={submitProduct}>
            <input name="sku" placeholder="SKU" value={productForm.sku} onChange={handleChange(setProductForm)} required />
            <input name="name" placeholder="Product name" value={productForm.name} onChange={handleChange(setProductForm)} required />
            <input name="price" type="number" min="0.01" step="0.01" placeholder="Price" value={productForm.price} onChange={handleChange(setProductForm)} required />
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              placeholder="Stock quantity"
              value={productForm.stock_quantity}
              onChange={handleChange(setProductForm)}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={productForm.description}
              onChange={handleChange(setProductForm)}
              rows="3"
            />
            <button type="submit">Save Product</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Add Customer</h2>
            <p>Emails are unique and validated by the API.</p>
          </div>
          <form className="form-grid" onSubmit={submitCustomer}>
            <input name="name" placeholder="Customer name" value={customerForm.name} onChange={handleChange(setCustomerForm)} required />
            <input name="email" type="email" placeholder="Email address" value={customerForm.email} onChange={handleChange(setCustomerForm)} required />
            <input name="phone" placeholder="Phone number" value={customerForm.phone} onChange={handleChange(setCustomerForm)} />
            <textarea
              name="address"
              placeholder="Address"
              value={customerForm.address}
              onChange={handleChange(setCustomerForm)}
              rows="3"
            />
            <button type="submit">Save Customer</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Create Order</h2>
            <p>Orders reduce stock automatically and reject insufficient inventory.</p>
          </div>
          <form className="form-grid" onSubmit={submitOrder}>
            <select name="customer_id" value={orderForm.customer_id} onChange={handleChange(setOrderForm)} required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
            <select name="product_id" value={orderForm.product_id} onChange={handleChange(setOrderForm)} required>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - stock {product.stock_quantity}
                </option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="Quantity"
              value={orderForm.quantity}
              onChange={handleChange(setOrderForm)}
              required
            />
            <button type="submit">Place Order</button>
          </form>
        </section>

        <section className="panel panel-wide">
          <div className="panel-heading">
            <h2>Inventory Snapshot</h2>
            <p>Current catalog and live stock counts.</p>
          </div>
          {loading ? (
            <p className="empty-state">Loading products...</p>
          ) : (
            <div className="card-grid">
              {products.length ? (
                products.map((product) => (
                  <article className="inventory-card" key={product.id}>
                    <div className="inventory-card-top">
                      <span>{product.sku}</span>
                      <strong>{product.stock_quantity} in stock</strong>
                    </div>
                    <h3>{product.name}</h3>
                    <p>{product.description || "No description provided."}</p>
                    <footer>
                      <span>${Number(product.price).toFixed(2)}</span>
                    </footer>
                  </article>
                ))
              ) : (
                <p className="empty-state">No products yet.</p>
              )}
            </div>
          )}
        </section>

        <section className="panel panel-wide">
          <div className="panel-heading">
            <h2>Recent Orders</h2>
            <p>Customer orders with totals and ordered items.</p>
          </div>
          {loading ? (
            <p className="empty-state">Loading orders...</p>
          ) : orders.length ? (
            <div className="order-list">
              {orders.map((order) => (
                <article className="order-row" key={order.id}>
                  <div>
                    <span className="order-label">Order #{order.id}</span>
                    <h3>{order.customer.name}</h3>
                    <p>{order.customer.email}</p>
                  </div>
                  <div>
                    <span className="order-label">Items</span>
                    <p>{order.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", ")}</p>
                  </div>
                  <div>
                    <span className="order-label">Total</span>
                    <strong>${Number(order.total_amount).toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No orders yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
