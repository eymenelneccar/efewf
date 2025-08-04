import {
  users,
  products,
  customers,
  suppliers,
  transactions,
  transactionItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Supplier,
  type InsertSupplier,
  type Transaction,
  type InsertTransaction,
  type TransactionItem,
  type InsertTransactionItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, like, and, or, count } from "drizzle-orm";
import { generateSKU, generateSupplierCode, generateProductCodeForSupplier } from "../utils/sku.js";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getProducts(search?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(): Promise<Product[]>;

  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  getSuppliers(search?: string): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  getSupplierProducts(supplierId: string): Promise<Product[]>;

  getTransactions(limit?: number, offset?: number, search?: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transactionData: InsertTransaction): Promise<Transaction>;
  createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;

  getDashboardMetrics(): Promise<{
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    newCustomers: number;
    lowStockCount: number;
    pendingOrders: number;
    activeCustomers: number;
    returns: number;
  }>;

  updateProductStock(productId: string, quantityChange: number, operation?: 'add' | 'subtract'): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProducts(search?: string) {
    if (search) {
      return await db
        .select()
        .from(products)
        .where(
          sql`${products.name} ILIKE ${`%${search}%`} OR ${products.sku} ILIKE ${`%${search}%`} OR ${products.barcode} ILIKE ${`%${search}%`}`
        )
        .orderBy(desc(products.createdAt));
    }
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductByBarcode(barcode: string) {
    // البحث أولاً بالباركود المحفوظ
    let [product] = await db.select().from(products).where(eq(products.barcode, barcode));

    // إذا لم نجد المنتج، ابحث بواسطة SKU
    if (!product) {
      [product] = await db.select().from(products).where(eq(products.sku, barcode));
    }

    return product;
  }

  async getProduct(id: string) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      console.log("Creating product in storage with data:", productData);

      if (!productData.sku) {
        if (productData.supplierId) {
          // Get supplier code
          const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, productData.supplierId)).limit(1);
          if (supplier?.supplierCode) {
            // Count existing products for this supplier
            const existingProducts = await db
              .select({ count: count() })
              .from(products)
              .where(eq(products.supplierId, productData.supplierId));

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

  async updateProduct(id: string, product: Partial<InsertProduct>) {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string) {
    await db.delete(products).where(eq(products.id, id));
  }

  async getLowStockProducts() {
    return await db
      .select()
      .from(products)
      .where(sql`${products.quantity} <= ${products.minQuantity}`)
      .orderBy(products.quantity);
  }

  async getCustomers(search?: string) {
    if (search) {
      return await db
        .select()
        .from(customers)
        .where(like(customers.name, `%${search}%`))
        .orderBy(desc(customers.createdAt));
    }
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByName(name: string) {
    const [customer] = await db.select().from(customers).where(eq(customers.name, name));
    return customer;
  }

  async createCustomer(customer: InsertCustomer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>) {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async updateCustomerDebt(customerId: string, amount: string, currency: string, operation: 'add' | 'subtract' = 'add') {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) {
        console.error("Customer not found:", customerId);
        return null;
      }

      // Convert amount to TRY if needed (approximate rate: 1 USD = 33 TRY)
      let amountInTRY = parseFloat(amount);
      if (currency === 'USD') {
        amountInTRY = amountInTRY * 33;
      }

      const currentDebt = parseFloat(customer.totalDebt || "0");
      const newDebt = operation === 'add' ? currentDebt + amountInTRY : Math.max(0, currentDebt - amountInTRY);

      console.log(`Updating customer debt: ${customer.name} - Current: ${currentDebt}, Change: ${operation} ${amountInTRY}, New: ${newDebt}`);

      const [updatedCustomer] = await db.update(customers)
        .set({ 
          totalDebt: newDebt.toString(),
          debtCurrency: "TRY",
          updatedAt: new Date()
        })
        .where(eq(customers.id, customerId))
        .returning();

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

  async updateProductStock(productId: string, quantityChange: number, operation: 'add' | 'subtract' = 'subtract') {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      const currentQuantity = product.quantity || 0;
      const newQuantity = operation === 'add' 
        ? currentQuantity + quantityChange 
        : Math.max(0, currentQuantity - quantityChange);

      const [updatedProduct] = await db
        .update(products)
        .set({ 
          quantity: newQuantity,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId))
        .returning();

      console.log(`تم تحديث مخزون المنتج ${product.name}: ${currentQuantity} -> ${newQuantity}`);
      return updatedProduct;
    } catch (error) {
      console.error("خطأ في تحديث المخزون:", error);
      throw error;
    }
  }

  async getCustomerDebtStatus(customerId: string) {
    const customer = await this.getCustomer(customerId);
    if (!customer) return null;

    const debt = parseFloat(customer.totalDebt || "0");
    const debtLimitTRY = 5000;
    const debtLimitUSD = 150;

    return {
      debt,
      currency: customer.debtCurrency || "TRY",
      isOverLimit: debt >= debtLimitTRY,
      debtInUSD: debt / 33,
      isOverLimitUSD: (debt / 33) >= debtLimitUSD
    };
  }

  async getSuppliers(search?: string) {
    if (search) {
      return await db
        .select()
        .from(suppliers)
        .where(like(suppliers.name, `%${search}%`))
        .orderBy(desc(suppliers.createdAt));
    }
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: string) {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    try {
      const [supplier] = await db.insert(suppliers).values(supplierData).returning();
      return supplier;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw new Error("Failed to create supplier");
    }
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>) {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      // أولاً، احذف جميع المنتجات المرتبطة بهذا المورد
      const supplierProducts = await db
        .select()
        .from(products)
        .where(eq(products.supplierId, id));

      if (supplierProducts.length > 0) {
        await db
          .delete(products)
          .where(eq(products.supplierId, id));
      }

      // ثم احذف المورد
      const result = await db.delete(suppliers).where(eq(suppliers.id, id));

      if (result.rowCount === 0) {
        throw new Error("المورد غير موجود");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  }

  async getSupplierProducts(supplierId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.supplierId, supplierId),
        eq(products.isActive, true)
      ))
      .orderBy(desc(products.createdAt));
  }

  async getTransactions(limit: number = 50, offset: number = 0, search?: string) {
    if (search) {
      return await db
        .select()
        .from(transactions)
        .where(
          or(
            like(transactions.transactionNumber, `%${search}%`),
            like(transactions.customerName, `%${search}%`)
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(transactions.createdAt));
    }

    return await db
      .select()
      .from(transactions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string) {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const lastTransaction = await db
      .select({ number: transactions.transactionNumber })
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    let newNumber = 1;

    if (lastTransaction.length > 0) {
      const lastNumber = parseInt(
        lastTransaction[0].number?.replace("INV-", "") || "0",
        10
      );
      newNumber = lastNumber + 1;
    }

    const transactionNumber = `INV-${newNumber.toString().padStart(3, "0")}`;

    const [transaction] = await db
      .insert(transactions)
      .values({
        transactionNumber,
        ...transactionData,
        updatedAt: new Date(),
      })
      .returning();

    return transaction;
  }

  async createTransactionItem(item: InsertTransactionItem) {
    try {
      // إنشاء عنصر المعاملة
      const [newItem] = await db.insert(transactionItems).values(item).returning();

      // تحديث مخزون المنتج إذا كان هناك productId
      if (item.productId && item.quantity) {
        await this.updateProductStock(item.productId, item.quantity, 'subtract');
      }

      return newItem;
    } catch (error) {
      console.error("خطأ في إنشاء عنصر المعاملة:", error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async getDashboardMetrics() {
    try {
      console.log("📊 Calculating dashboard metrics...");

      // إحصائيات المعاملات (استثناء سداد الديون)
      const totalTransactionsResult = await db
        .select({ count: count() })
        .from(transactions)
        .where(sql`${transactions.transactionType} != 'debt_collection' OR ${transactions.transactionType} IS NULL`);

      const totalTransactions = totalTransactionsResult[0]?.count || 0;
      console.log("📈 Total transactions (excluding debt collections):", totalTransactions);

      // إجمالي المبيعات (استثناء تحصيل الديون)
      const totalSalesResult = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(${transactions.total}), 0)` 
        })
        .from(transactions)
        .where(sql`${transactions.status} = 'completed' AND (${transactions.transactionType} != 'debt_collection' OR ${transactions.transactionType} IS NULL)`);

    const activeProductsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true));

    const newCustomersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(sql`EXTRACT(MONTH FROM ${customers.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    const lowStockResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.quantity} <= ${products.minQuantity}`);

    const pendingOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(eq(transactions.status, "pending"));

    const activeCustomersResult = await db
      .select({ count: sql<number>`count(DISTINCT ${transactions.customerId})` })
      .from(transactions)
      .where(sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    const returnsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(eq(transactions.status, "cancelled"));

      const totalSales = totalSalesResult[0]?.total || 0;
      console.log("💰 Total sales:", totalSales);

    return {
      totalSales: totalSales,
      totalOrders: totalTransactions,
      activeProducts: activeProductsResult[0]?.count || 0,
      newCustomers: newCustomersResult[0]?.count || 0,
      lowStockCount: lowStockResult[0]?.count || 0,
      pendingOrders: pendingOrdersResult[0]?.count || 0,
      activeCustomers: activeCustomersResult[0]?.count || 0,
      returns: returnsResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("❌ Error calculating dashboard metrics:", error);
    throw error;
  }
}

  async getProductSalesHistory(productId: string) {
    const result = await db
      .select({
        transactionId: transactionItems.transactionId,
        transactionNumber: transactions.transactionNumber,
        customerName: transactions.customerName,
        quantity: transactionItems.quantity,
        price: transactionItems.price,
        total: transactionItems.total,
        saleDate: transactions.createdAt,
        status: transactions.status
      })
      .from(transactionItems)
      .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(eq(transactionItems.productId, productId))
      .orderBy(desc(transactions.createdAt));

    const totalQuantitySold = result.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const totalSales = result.length;

    return {
      totalQuantitySold,
      totalSales,
      salesHistory: result
    };
  }
}

export const storage = new DatabaseStorage();