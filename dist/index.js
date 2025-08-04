"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"));

// server/routes.ts
var import_http = require("http");

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  customers: () => customers,
  insertCustomerSchema: () => insertCustomerSchema,
  insertProductSchema: () => insertProductSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertTransactionItemSchema: () => insertTransactionItemSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  products: () => products,
  sessions: () => sessions,
  shipmentsTable: () => shipmentsTable,
  suppliers: () => suppliers,
  transactionItems: () => transactionItems,
  transactions: () => transactions,
  users: () => users
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var import_zod = require("zod");
var sessions = (0, import_pg_core.pgTable)(
  "sessions",
  {
    sid: (0, import_pg_core.varchar)("sid").primaryKey(),
    sess: (0, import_pg_core.jsonb)("sess").notNull(),
    expire: (0, import_pg_core.timestamp)("expire").notNull()
  },
  (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  username: (0, import_pg_core.varchar)("username").unique(),
  email: (0, import_pg_core.varchar)("email").unique(),
  firstName: (0, import_pg_core.varchar)("first_name"),
  lastName: (0, import_pg_core.varchar)("last_name"),
  profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
  role: (0, import_pg_core.varchar)("role").default("employee"),
  // admin, employee
  isActive: (0, import_pg_core.boolean)("is_active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var products = (0, import_pg_core.pgTable)("products", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  name: (0, import_pg_core.varchar)("name").notNull(),
  description: (0, import_pg_core.text)("description"),
  sku: (0, import_pg_core.varchar)("sku").unique().notNull(),
  barcode: (0, import_pg_core.varchar)("barcode").unique(),
  category: (0, import_pg_core.varchar)("category"),
  price: (0, import_pg_core.decimal)("price", { precision: 10, scale: 2 }).notNull(),
  cost: (0, import_pg_core.decimal)("cost", { precision: 10, scale: 2 }),
  currency: (0, import_pg_core.varchar)("currency").default("TRY"),
  // TRY, USD
  supplierId: (0, import_pg_core.varchar)("supplier_id").references(() => suppliers.id),
  quantity: (0, import_pg_core.integer)("quantity").default(0),
  minQuantity: (0, import_pg_core.integer)("min_quantity").default(0),
  isActive: (0, import_pg_core.boolean)("is_active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var customers = (0, import_pg_core.pgTable)("customers", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  name: (0, import_pg_core.varchar)("name").notNull(),
  email: (0, import_pg_core.varchar)("email"),
  phone: (0, import_pg_core.varchar)("phone"),
  address: (0, import_pg_core.text)("address"),
  totalDebt: (0, import_pg_core.decimal)("total_debt", { precision: 10, scale: 2 }).default("0"),
  debtCurrency: (0, import_pg_core.varchar)("debt_currency").default("TRY"),
  // TRY, USD
  isActive: (0, import_pg_core.boolean)("is_active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var transactions = (0, import_pg_core.pgTable)("transactions", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  transactionNumber: (0, import_pg_core.varchar)("transaction_number").unique().notNull(),
  customerId: (0, import_pg_core.varchar)("customer_id").references(() => customers.id),
  customerName: (0, import_pg_core.varchar)("customer_name").notNull(),
  total: (0, import_pg_core.decimal)("total", { precision: 10, scale: 2 }).notNull(),
  discount: (0, import_pg_core.decimal)("discount", { precision: 10, scale: 2 }).default("0"),
  tax: (0, import_pg_core.decimal)("tax", { precision: 10, scale: 2 }).default("0"),
  paymentType: (0, import_pg_core.varchar)("payment_type").default("cash"),
  // cash, credit, debt_collection
  currency: (0, import_pg_core.varchar)("currency").default("TRY"),
  // TRY, USD
  status: (0, import_pg_core.varchar)("status").default("completed"),
  // completed, pending, cancelled
  transactionType: (0, import_pg_core.varchar)("transaction_type").default("sale"),
  // sale, debt_collection
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var transactionItems = (0, import_pg_core.pgTable)("transaction_items", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  transactionId: (0, import_pg_core.varchar)("transaction_id").references(() => transactions.id).notNull(),
  productId: (0, import_pg_core.varchar)("product_id").references(() => products.id).notNull(),
  productName: (0, import_pg_core.varchar)("product_name").notNull(),
  quantity: (0, import_pg_core.integer)("quantity").notNull(),
  price: (0, import_pg_core.decimal)("price", { precision: 10, scale: 2 }).notNull(),
  total: (0, import_pg_core.decimal)("total", { precision: 10, scale: 2 }).notNull()
});
var insertProductSchema = (0, import_drizzle_zod.createInsertSchema)(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  price: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).transform(
    (val) => typeof val === "string" ? val : val.toString()
  ),
  cost: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional().transform(
    (val) => val === void 0 ? val : typeof val === "string" ? val : val.toString()
  )
});
var insertCustomerSchema = (0, import_drizzle_zod.createInsertSchema)(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTransactionSchema = (0, import_drizzle_zod.createInsertSchema)(transactions).omit({
  id: true,
  transactionNumber: true,
  createdAt: true,
  updatedAt: true
}).extend({
  paymentType: import_zod.z.enum(["cash", "credit", "debt_collection"]).default("cash"),
  currency: import_zod.z.enum(["TRY", "USD"]).default("TRY"),
  transactionType: import_zod.z.enum(["sale", "debt_collection"]).default("sale")
});
var insertTransactionItemSchema = (0, import_drizzle_zod.createInsertSchema)(transactionItems).omit({
  id: true
});
var suppliers = (0, import_pg_core.pgTable)("suppliers", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  supplierCode: (0, import_pg_core.varchar)("supplier_code").unique().notNull(),
  name: (0, import_pg_core.varchar)("name").notNull(),
  contactPerson: (0, import_pg_core.varchar)("contact_person"),
  email: (0, import_pg_core.varchar)("email"),
  phone: (0, import_pg_core.varchar)("phone"),
  address: (0, import_pg_core.text)("address"),
  taxNumber: (0, import_pg_core.varchar)("tax_number"),
  paymentTerms: (0, import_pg_core.varchar)("payment_terms"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
});
var insertSupplierSchema = (0, import_drizzle_zod.createInsertSchema)(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  supplierCode: import_zod.z.string().min(1, "\u0643\u0648\u062F \u0627\u0644\u0645\u0648\u0631\u062F \u0645\u0637\u0644\u0648\u0628")
});
var shipmentsTable = (0, import_pg_core.pgTable)("shipments", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  customerName: (0, import_pg_core.text)("customer_name").notNull(),
  address: (0, import_pg_core.text)("address").notNull(),
  phone: (0, import_pg_core.text)("phone"),
  status: (0, import_pg_core.text)("status").notNull().default("unpaid"),
  // "paid" | "unpaid"
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});

// server/db.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_serverless = require("drizzle-orm/neon-serverless");
var import_ws = __toESM(require("ws"));
import_serverless.neonConfig.webSocketConstructor = import_ws.default;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new import_serverless.Pool({ connectionString: process.env.DATABASE_URL });
var db = (0, import_neon_serverless.drizzle)({ client: pool, schema: schema_exports });

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");

// utils/sku.ts
function generateSKU(type) {
  const typeCode = type.trim().substring(0, 3).toUpperCase();
  const dateCode = (/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "");
  const randomCode = Math.floor(1e3 + Math.random() * 9e3);
  return `${typeCode}-${dateCode}-${randomCode}`;
}
function generateProductCodeForSupplier(supplierCode, productCount) {
  const paddedCount = productCount.toString().padStart(3, "0");
  return `${supplierCode}-${paddedCount}`;
}

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getProducts(search) {
    if (search) {
      return await db.select().from(products).where(
        import_drizzle_orm2.sql`${products.name} ILIKE ${`%${search}%`} OR ${products.sku} ILIKE ${`%${search}%`} OR ${products.barcode} ILIKE ${`%${search}%`}`
      ).orderBy((0, import_drizzle_orm2.desc)(products.createdAt));
    }
    return await db.select().from(products).orderBy((0, import_drizzle_orm2.desc)(products.createdAt));
  }
  async getProductByBarcode(barcode) {
    let [product] = await db.select().from(products).where((0, import_drizzle_orm2.eq)(products.barcode, barcode));
    if (!product) {
      [product] = await db.select().from(products).where((0, import_drizzle_orm2.eq)(products.sku, barcode));
    }
    return product;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where((0, import_drizzle_orm2.eq)(products.id, id));
    return product;
  }
  async createProduct(productData) {
    try {
      console.log("Creating product in storage with data:", productData);
      if (!productData.sku) {
        if (productData.supplierId) {
          const [supplier] = await db.select().from(suppliers).where((0, import_drizzle_orm2.eq)(suppliers.id, productData.supplierId)).limit(1);
          if (supplier?.supplierCode) {
            const existingProducts = await db.select({ count: (0, import_drizzle_orm2.count)() }).from(products).where((0, import_drizzle_orm2.eq)(products.supplierId, productData.supplierId));
            const productCount = existingProducts[0]?.count || 0;
            productData.sku = generateProductCodeForSupplier(supplier.supplierCode, productCount + 1);
          } else {
            productData.sku = generateSKU(productData.name);
          }
        } else {
          productData.sku = generateSKU(productData.name);
        }
      }
      const [product] = await db.insert(products).values(productData).returning();
      console.log("Product created successfully:", product);
      return product;
    } catch (error) {
      console.error("Database error in createProduct:", error);
      throw error;
    }
  }
  async updateProduct(id, product) {
    const [updatedProduct] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    await db.delete(products).where((0, import_drizzle_orm2.eq)(products.id, id));
  }
  async getLowStockProducts() {
    return await db.select().from(products).where(import_drizzle_orm2.sql`${products.quantity} <= ${products.minQuantity}`).orderBy(products.quantity);
  }
  async getCustomers(search) {
    if (search) {
      return await db.select().from(customers).where((0, import_drizzle_orm2.like)(customers.name, `%${search}%`)).orderBy((0, import_drizzle_orm2.desc)(customers.createdAt));
    }
    return await db.select().from(customers).orderBy((0, import_drizzle_orm2.desc)(customers.createdAt));
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where((0, import_drizzle_orm2.eq)(customers.id, id));
    return customer;
  }
  async getCustomerByName(name) {
    const [customer] = await db.select().from(customers).where((0, import_drizzle_orm2.eq)(customers.name, name));
    return customer;
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(customers.id, id)).returning();
    return updatedCustomer;
  }
  async deleteCustomer(id) {
    await db.delete(customers).where((0, import_drizzle_orm2.eq)(customers.id, id));
  }
  async updateCustomerDebt(customerId, amount, currency, operation = "add") {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) {
        console.error("Customer not found:", customerId);
        return null;
      }
      let amountInTRY = parseFloat(amount);
      if (currency === "USD") {
        amountInTRY = amountInTRY * 33;
      }
      const currentDebt = parseFloat(customer.totalDebt || "0");
      const newDebt = operation === "add" ? currentDebt + amountInTRY : Math.max(0, currentDebt - amountInTRY);
      console.log(`Updating customer debt: ${customer.name} - Current: ${currentDebt}, Change: ${operation} ${amountInTRY}, New: ${newDebt}`);
      const [updatedCustomer] = await db.update(customers).set({
        totalDebt: newDebt.toString(),
        debtCurrency: "TRY",
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm2.eq)(customers.id, customerId)).returning();
      if (!updatedCustomer) {
        throw new Error("Failed to update customer debt");
      }
      console.log("Customer debt updated successfully");
      return newDebt;
    } catch (error) {
      console.error("Error updating customer debt:", error);
      throw error;
    }
  }
  async updateProductStock(productId, quantityChange, operation = "subtract") {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error("\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const currentQuantity = product.quantity || 0;
      const newQuantity = operation === "add" ? currentQuantity + quantityChange : Math.max(0, currentQuantity - quantityChange);
      const [updatedProduct] = await db.update(products).set({
        quantity: newQuantity,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm2.eq)(products.id, productId)).returning();
      console.log(`\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u0645\u0646\u062A\u062C ${product.name}: ${currentQuantity} -> ${newQuantity}`);
      return updatedProduct;
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u062E\u0632\u0648\u0646:", error);
      throw error;
    }
  }
  async getCustomerDebtStatus(customerId) {
    const customer = await this.getCustomer(customerId);
    if (!customer) return null;
    const debt = parseFloat(customer.totalDebt || "0");
    const debtLimitTRY = 5e3;
    const debtLimitUSD = 150;
    return {
      debt,
      currency: customer.debtCurrency || "TRY",
      isOverLimit: debt >= debtLimitTRY,
      debtInUSD: debt / 33,
      isOverLimitUSD: debt / 33 >= debtLimitUSD
    };
  }
  async getSuppliers(search) {
    if (search) {
      return await db.select().from(suppliers).where((0, import_drizzle_orm2.like)(suppliers.name, `%${search}%`)).orderBy((0, import_drizzle_orm2.desc)(suppliers.createdAt));
    }
    return await db.select().from(suppliers).orderBy((0, import_drizzle_orm2.desc)(suppliers.createdAt));
  }
  async getSupplier(id) {
    const [supplier] = await db.select().from(suppliers).where((0, import_drizzle_orm2.eq)(suppliers.id, id));
    return supplier;
  }
  async createSupplier(supplierData) {
    try {
      const [supplier] = await db.insert(suppliers).values(supplierData).returning();
      return supplier;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw new Error("Failed to create supplier");
    }
  }
  async updateSupplier(id, supplier) {
    const [updatedSupplier] = await db.update(suppliers).set({ ...supplier, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(suppliers.id, id)).returning();
    return updatedSupplier;
  }
  async deleteSupplier(id) {
    try {
      const supplierProducts = await db.select().from(products).where((0, import_drizzle_orm2.eq)(products.supplierId, id));
      if (supplierProducts.length > 0) {
        await db.delete(products).where((0, import_drizzle_orm2.eq)(products.supplierId, id));
      }
      const result = await db.delete(suppliers).where((0, import_drizzle_orm2.eq)(suppliers.id, id));
      if (result.rowCount === 0) {
        throw new Error("\u0627\u0644\u0645\u0648\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  }
  async getSupplierProducts(supplierId) {
    return await db.select().from(products).where((0, import_drizzle_orm2.and)(
      (0, import_drizzle_orm2.eq)(products.supplierId, supplierId),
      (0, import_drizzle_orm2.eq)(products.isActive, true)
    )).orderBy((0, import_drizzle_orm2.desc)(products.createdAt));
  }
  async getTransactions(limit = 50, offset = 0, search) {
    if (search) {
      return await db.select().from(transactions).where(
        (0, import_drizzle_orm2.or)(
          (0, import_drizzle_orm2.like)(transactions.transactionNumber, `%${search}%`),
          (0, import_drizzle_orm2.like)(transactions.customerName, `%${search}%`)
        )
      ).limit(limit).offset(offset).orderBy((0, import_drizzle_orm2.desc)(transactions.createdAt));
    }
    return await db.select().from(transactions).limit(limit).offset(offset).orderBy((0, import_drizzle_orm2.desc)(transactions.createdAt));
  }
  async getTransaction(id) {
    const [transaction] = await db.select().from(transactions).where((0, import_drizzle_orm2.eq)(transactions.id, id));
    return transaction;
  }
  async createTransaction(transactionData) {
    const lastTransaction = await db.select({ number: transactions.transactionNumber }).from(transactions).orderBy((0, import_drizzle_orm2.desc)(transactions.createdAt)).limit(1);
    let newNumber = 1;
    if (lastTransaction.length > 0) {
      const lastNumber = parseInt(
        lastTransaction[0].number?.replace("INV-", "") || "0",
        10
      );
      newNumber = lastNumber + 1;
    }
    const transactionNumber = `INV-${newNumber.toString().padStart(3, "0")}`;
    const [transaction] = await db.insert(transactions).values({
      transactionNumber,
      ...transactionData,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return transaction;
  }
  async createTransactionItem(item) {
    try {
      const [newItem] = await db.insert(transactionItems).values(item).returning();
      if (item.productId && item.quantity) {
        await this.updateProductStock(item.productId, item.quantity, "subtract");
      }
      return newItem;
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0639\u0646\u0635\u0631 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629:", error);
      throw error;
    }
  }
  async updateTransaction(id, updates) {
    const [updatedTransaction] = await db.update(transactions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(transactions.id, id)).returning();
    return updatedTransaction;
  }
  async getDashboardMetrics() {
    try {
      console.log("\u{1F4CA} Calculating dashboard metrics...");
      const totalTransactionsResult = await db.select({ count: (0, import_drizzle_orm2.count)() }).from(transactions).where(import_drizzle_orm2.sql`${transactions.transactionType} != 'debt_collection' OR ${transactions.transactionType} IS NULL`);
      const totalTransactions = totalTransactionsResult[0]?.count || 0;
      console.log("\u{1F4C8} Total transactions (excluding debt collections):", totalTransactions);
      const totalSalesResult = await db.select({
        total: import_drizzle_orm2.sql`COALESCE(SUM(${transactions.total}), 0)`
      }).from(transactions).where(import_drizzle_orm2.sql`${transactions.status} = 'completed' AND (${transactions.transactionType} != 'debt_collection' OR ${transactions.transactionType} IS NULL)`);
      const activeProductsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(products).where((0, import_drizzle_orm2.eq)(products.isActive, true));
      const newCustomersResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(customers).where(import_drizzle_orm2.sql`EXTRACT(MONTH FROM ${customers.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);
      const lowStockResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(products).where(import_drizzle_orm2.sql`${products.quantity} <= ${products.minQuantity}`);
      const pendingOrdersResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(transactions).where((0, import_drizzle_orm2.eq)(transactions.status, "pending"));
      const activeCustomersResult = await db.select({ count: import_drizzle_orm2.sql`count(DISTINCT ${transactions.customerId})` }).from(transactions).where(import_drizzle_orm2.sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);
      const returnsResult = await db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(transactions).where((0, import_drizzle_orm2.eq)(transactions.status, "cancelled"));
      const totalSales = totalSalesResult[0]?.total || 0;
      console.log("\u{1F4B0} Total sales:", totalSales);
      return {
        totalSales,
        totalOrders: totalTransactions,
        activeProducts: activeProductsResult[0]?.count || 0,
        newCustomers: newCustomersResult[0]?.count || 0,
        lowStockCount: lowStockResult[0]?.count || 0,
        pendingOrders: pendingOrdersResult[0]?.count || 0,
        activeCustomers: activeCustomersResult[0]?.count || 0,
        returns: returnsResult[0]?.count || 0
      };
    } catch (error) {
      console.error("\u274C Error calculating dashboard metrics:", error);
      throw error;
    }
  }
  async getProductSalesHistory(productId) {
    const result = await db.select({
      transactionId: transactionItems.transactionId,
      transactionNumber: transactions.transactionNumber,
      customerName: transactions.customerName,
      quantity: transactionItems.quantity,
      price: transactionItems.price,
      total: transactionItems.total,
      saleDate: transactions.createdAt,
      status: transactions.status
    }).from(transactionItems).leftJoin(transactions, (0, import_drizzle_orm2.eq)(transactionItems.transactionId, transactions.id)).where((0, import_drizzle_orm2.eq)(transactionItems.productId, productId)).orderBy((0, import_drizzle_orm2.desc)(transactions.createdAt));
    const totalQuantitySold = result.reduce((sum2, item) => sum2 + (item.quantity || 0), 0);
    const totalSales = result.length;
    return {
      totalQuantitySold,
      totalSales,
      salesHistory: result
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
var import_express_session = __toESM(require("express-session"));
var import_connect_pg_simple = __toESM(require("connect-pg-simple"));
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return (0, import_express_session.default)({
    secret: "local-dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.use(getSession());
}
var isAuthenticated = (req, res, next) => {
  return next();
};

// server/routes.ts
var import_zod2 = require("zod");
var import_drizzle_orm3 = require("drizzle-orm");
var import_crypto = require("crypto");
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const search = req.query.search;
      const products2 = await storage.getProducts(search);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      console.log("Creating product with data:", req.body);
      const processedData = {
        ...req.body,
        price: req.body.price ? req.body.price.toString() : "0",
        cost: req.body.cost ? req.body.cost.toString() : void 0,
        quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
        minQuantity: req.body.minQuantity ? parseInt(req.body.minQuantity) : 5
      };
      const productData = insertProductSchema.parse(processedData);
      console.log("Validated product data:", productData);
      const product = await storage.createProduct(productData);
      console.log("Created product:", product);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({
          message: "Invalid product data",
          errors: error.errors,
          receivedData: req.body
        });
      }
      console.error("Error creating product:", error);
      res.status(500).json({
        message: "Failed to create product",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
    }
  });
  app2.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/products/barcode/:barcode", isAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by barcode:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.get("/api/products/:id/sales-history", isAuthenticated, async (req, res) => {
    try {
      const salesHistory = await storage.getProductSalesHistory(req.params.id);
      res.json(salesHistory);
    } catch (error) {
      console.error("Error fetching product sales history:", error);
      res.status(500).json({ message: "Failed to fetch sales history" });
    }
  });
  app2.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const search = req.query.search;
      const customers2 = await storage.getCustomers(search);
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customerId = req.params.id;
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      const result = await storage.deleteCustomer(customerId);
      console.log(`Customer ${customerId} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (error instanceof Error && error.message?.includes("not found")) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/customers/:id/debt", isAuthenticated, async (req, res) => {
    try {
      const debtStatus = await storage.getCustomerDebtStatus(req.params.id);
      if (!debtStatus) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(debtStatus);
    } catch (error) {
      console.error("Error fetching customer debt status:", error);
      res.status(500).json({ message: "Failed to fetch debt status" });
    }
  });
  app2.post("/api/customers/:id/payment", isAuthenticated, async (req, res) => {
    try {
      const { amount, currency = "TRY" } = req.body;
      const customerId = req.params.id;
      console.log("Processing payment:", { customerId, amount, currency });
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      const paymentAmount = parseFloat(amount);
      if (paymentAmount <= 0) {
        return res.status(400).json({ message: "Payment amount must be greater than 0" });
      }
      const newDebt = await storage.updateCustomerDebt(customerId, amount, currency, "subtract");
      const now = /* @__PURE__ */ new Date();
      const transactionNumber = `PAYMENT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const debtCollectionTransaction = insertTransactionSchema.parse({
        transactionNumber,
        customerId: customer.id,
        customerName: customer.name,
        total: paymentAmount.toString(),
        discount: "0",
        tax: "0",
        paymentType: "cash",
        currency,
        status: "completed",
        transactionType: "debt_collection"
      });
      await storage.createTransaction(debtCollectionTransaction);
      console.log("Payment processed successfully:", { customerId, paymentAmount, newDebt });
      res.json({
        success: true,
        newDebt: Math.max(0, newDebt || 0),
        paymentAmount,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
  app2.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const search = req.query.search;
      const suppliers2 = await storage.getSuppliers(search);
      res.json(suppliers2);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/suppliers/:id/products", isAuthenticated, async (req, res) => {
    try {
      const products2 = await storage.getSupplierProducts(req.params.id);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
      res.status(500).json({ message: "Failed to fetch supplier products" });
    }
  });
  app2.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  app2.get("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });
  app2.put("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, supplierData);
      res.json(supplier);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });
  app2.delete("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      if (error instanceof Error && error.message === "Supplier not found") {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0648\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0631\u062F" });
    }
  });
  app2.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search;
      const transactions2 = await storage.getTransactions(limit, offset, search);
      res.json(transactions2);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      console.log("=== Transaction Creation Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      const { transaction, items } = req.body;
      if (!transaction) {
        console.error("\u274C Missing transaction data");
        return res.status(400).json({ message: "Missing transaction data" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("\u274C Missing or empty items array");
        return res.status(400).json({ message: "Missing or empty items" });
      }
      console.log("\u2705 Transaction data:", transaction);
      console.log("\u2705 Items count:", items.length);
      console.log("\u2705 Items:", items);
      const now = /* @__PURE__ */ new Date();
      const transactionNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      console.log("\u2705 Generated transaction number:", transactionNumber);
      const transactionData = insertTransactionSchema.parse({
        ...transaction,
        transactionNumber
      });
      console.log("\u2705 Parsed transaction data:", transactionData);
      const newTransaction = await storage.createTransaction(transactionData);
      console.log("\u2705 Created transaction:", newTransaction);
      if (Array.isArray(items) && items.length > 0) {
        console.log("\u{1F4E6} Creating transaction items...");
        for (const item of items) {
          console.log("Creating item:", item);
          const itemData = {
            ...item,
            transactionId: newTransaction.id,
            productId: item.productId || null
            // التأكد من تمرير productId
          };
          await storage.createTransactionItem(itemData);
        }
        console.log("\u2705 All items created successfully");
      }
      if (transactionData.paymentType === "credit" && transactionData.customerId) {
        console.log("\u{1F4B3} Updating customer debt...");
        await storage.updateCustomerDebt(
          transactionData.customerId,
          transactionData.total,
          transactionData.currency || "TRY",
          "add"
        );
        console.log("\u2705 Customer debt updated");
      }
      console.log("=== Transaction Creation Completed Successfully ===");
      res.status(201).json(newTransaction);
    } catch (error) {
      console.log("=== Transaction Creation Failed ===");
      console.error("\u274C Full error:", error);
      console.error("\u274C Error message:", error instanceof Error ? error.message : "Unknown error");
      console.error("\u274C Error stack:", error instanceof Error ? error.stack : "No stack trace");
      if (error instanceof import_zod2.z.ZodError) {
        console.error("\u274C Zod validation errors:", error.errors);
        return res.status(400).json({
          message: "Invalid transaction data",
          errors: error.errors,
          receivedData: req.body
        });
      }
      res.status(500).json({
        message: "Failed to create transaction",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.post("/api/admin/delete-all-data", isAuthenticated, async (req, res) => {
    try {
      const { confirmationCode } = req.body;
      if (confirmationCode !== "eymen") {
        return res.status(400).json({ message: "\u0631\u0645\u0632 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
      }
      console.log("\u0628\u062F\u0621 \u0639\u0645\u0644\u064A\u0629 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
      await db.delete(transactionItems);
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A");
      await db.delete(transactions);
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A");
      await db.delete(products);
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A");
      await db.delete(customers);
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0639\u0645\u0644\u0627\u0621");
      await db.delete(suppliers);
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646");
      console.log("\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D!");
      res.json({
        success: true,
        message: "\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
      });
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", error);
      res.status(500).json({
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
        error: error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"
      });
    }
  });
  app2.post("/api/payments", async (req, res) => {
    try {
      const { amount, transactionId, customerId } = req.body;
      if (!amount || !transactionId || !customerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      const currentTotal = parseFloat(transaction.total || "0");
      const paymentAmount = parseFloat(amount);
      const newTotal = currentTotal - paymentAmount;
      const customer = await storage.getCustomer(customerId);
      if (customer) {
        const currentDebt = parseFloat(customer.totalDebt || "0");
        const newDebt = Math.max(0, currentDebt - paymentAmount);
        await storage.updateCustomer(customerId, {
          totalDebt: newDebt.toString()
        });
        const now = /* @__PURE__ */ new Date();
        const transactionNumber = `PAYMENT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const debtCollectionTransaction = insertTransactionSchema.parse({
          transactionNumber,
          customerId: customer.id,
          customerName: customer.name,
          total: `${paymentAmount}`,
          // مبلغ التحصيل الفعلي (موجب)
          discount: "0",
          tax: "0",
          paymentType: "debt_collection",
          currency: transaction.currency || "TRY",
          status: "completed",
          transactionType: "debt_collection"
        });
        await storage.createTransaction(debtCollectionTransaction);
        if (newDebt === 0) {
          await storage.updateTransaction(transactionId, {
            status: "completed"
          });
        }
      }
      res.json({
        success: true,
        remainingAmount: newTotal,
        amount: paymentAmount,
        remainingDebt: Math.max(0, parseFloat(customer?.totalDebt || "0") - paymentAmount),
        message: newTotal === 0 ? "Payment completed" : "Partial payment recorded"
      });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/transactions/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await db.select().from(transactionItems).where((0, import_drizzle_orm3.eq)(transactionItems.transactionId, id));
      res.json(items);
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      res.status(500).json({ error: "Failed to fetch transaction items" });
    }
  });
  app2.put("/api/transactions/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body;
      await db.delete(transactionItems).where((0, import_drizzle_orm3.eq)(transactionItems.transactionId, id));
      if (items && items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          transactionId: id,
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: item.price,
          total: item.total
        }));
        await db.insert(transactionItems).values(itemsToInsert);
      }
      res.json({ success: true, message: "Items updated successfully" });
    } catch (error) {
      console.error("Error updating transaction items:", error);
      res.status(500).json({ error: "Failed to update transaction items" });
    }
  });
  app2.patch("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTransaction = await db.update(transactions).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm3.eq)(transactions.id, id)).returning();
      if (updatedTransaction.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(updatedTransaction[0]);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });
  app2.get("/api/dashboard/monthly-sales", isAuthenticated, async (req, res) => {
    try {
      const allTransactions = await storage.getTransactions(1e4, 0, "");
      const transactions2 = allTransactions.filter((t) => t.status === "completed");
      const monthlyData = {};
      const monthNames = [
        "\u064A\u0646\u0627\u064A\u0631",
        "\u0641\u0628\u0631\u0627\u064A\u0631",
        "\u0645\u0627\u0631\u0633",
        "\u0623\u0628\u0631\u064A\u0644",
        "\u0645\u0627\u064A\u0648",
        "\u064A\u0648\u0646\u064A\u0648",
        "\u064A\u0648\u0644\u064A\u0648",
        "\u0623\u063A\u0633\u0637\u0633",
        "\u0633\u0628\u062A\u0645\u0628\u0631",
        "\u0623\u0643\u062A\u0648\u0628\u0631",
        "\u0646\u0648\u0641\u0645\u0628\u0631",
        "\u062F\u064A\u0633\u0645\u0628\u0631"
      ];
      const now = /* @__PURE__ */ new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[monthKey] = 0;
      }
      transactions2.forEach((transaction) => {
        const date = new Date(transaction.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += Number(transaction.total);
        }
      });
      const chartData = Object.entries(monthlyData).map(([monthKey, sales]) => {
        const [year, month] = monthKey.split("-");
        const monthIndex = parseInt(month) - 1;
        const monthName = monthNames[monthIndex];
        return {
          month: monthKey,
          monthName: `${monthName} ${year}`,
          sales
        };
      });
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching monthly sales data:", error);
      res.status(500).json({ error: "Failed to fetch monthly sales data" });
    }
  });
  app2.get("/api/shipments", async (req, res) => {
    try {
      const shipments = await db.select().from(shipmentsTable).orderBy((0, import_drizzle_orm3.desc)(shipmentsTable.createdAt));
      res.json(shipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      res.status(500).json({ error: "Failed to fetch shipments" });
    }
  });
  app2.post("/api/shipments", async (req, res) => {
    try {
      const { customerName, address, phone, status, createdAt } = req.body;
      if (!customerName || !address) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0637\u0644\u0648\u0628\u0627\u0646"
        });
      }
      const newShipment = {
        id: (0, import_crypto.randomUUID)(),
        customerName: customerName.trim(),
        address: address.trim(),
        phone: phone ? phone.trim() : null,
        status: status || "unpaid",
        createdAt: createdAt ? new Date(createdAt) : /* @__PURE__ */ new Date()
      };
      console.log("Creating shipment:", newShipment);
      const [shipment] = await db.insert(shipmentsTable).values(newShipment).returning();
      console.log("Shipment created successfully:", shipment);
      res.json(shipment);
    } catch (error) {
      console.error("Error creating shipment:", error);
      res.status(500).json({
        error: "Failed to create shipment",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0634\u062D\u0646\u0629: " + (error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641")
      });
    }
  });
  app2.patch("/api/shipments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [updatedShipment] = await db.update(shipmentsTable).set({ status }).where((0, import_drizzle_orm3.eq)(shipmentsTable.id, id)).returning();
      if (!updatedShipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }
      res.json(updatedShipment);
    } catch (error) {
      console.error("Error updating shipment:", error);
      res.status(500).json({ error: "Failed to update shipment" });
    }
  });
  app2.delete("/api/shipments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(shipmentsTable).where((0, import_drizzle_orm3.eq)(shipmentsTable.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting shipment:", error);
      res.status(500).json({ error: "Failed to delete shipment" });
    }
  });
  const httpServer = (0, import_http.createServer)(app2);
  return httpServer;
}

// server/vite.ts
var import_express = __toESM(require("express"));
var import_fs = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_vite2 = require("vite");

// vite.config.ts
var import_vite = require("vite");
var import_plugin_react = __toESM(require("@vitejs/plugin-react"));
var import_path = __toESM(require("path"));
var import_url = require("url");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var vite_config_default = (0, import_vite.defineConfig)({
  plugins: [(0, import_plugin_react.default)()],
  resolve: {
    alias: {
      "@": import_path.default.resolve(__dirname, "client", "src"),
      "@shared": import_path.default.resolve(__dirname, "shared"),
      "@assets": import_path.default.resolve(__dirname, "attached_assets")
    }
  },
  root: import_path.default.resolve(__dirname, "client"),
  build: {
    outDir: import_path.default.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
var import_nanoid = require("nanoid");
var import_meta2 = {};
var viteLogger = (0, import_vite2.createLogger)();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path2.default.resolve(
        import_meta2.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await import_fs.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = import_path2.default.resolve(import_meta2.dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express.default.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path2.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
app.use(import_express2.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "localhost", () => {
    log(`serving on http://localhost:${port}`);
  });
})();
