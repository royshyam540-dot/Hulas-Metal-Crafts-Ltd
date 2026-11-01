import { useEffect, useState } from 'react';
import {
  Product,
  Category,
  InventoryTransaction,
  Inquiry,
  ContactMessage,
  Customer,
  CompanySettings,
  AdminUser,
  AppNotification,
  ActivityLog,
  MovementType,
  InquiryStatus,
  UserRole
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_INQUIRIES,
  INITIAL_TRANSACTIONS,
  INITIAL_CUSTOMERS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_ADMIN_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'hmc_products_v1',
  CATEGORIES: 'hmc_categories_v1',
  TRANSACTIONS: 'hmc_inventory_tx_v1',
  INQUIRIES: 'hmc_inquiries_v1',
  CUSTOMERS: 'hmc_customers_v1',
  CONTACTS: 'hmc_contacts_v1',
  SETTINGS: 'hmc_settings_v1',
  USERS: 'hmc_admin_users_v1',
  CURRENT_USER: 'hmc_current_user_v1',
  NOTIFICATIONS: 'hmc_notifications_v1',
  LOGS: 'hmc_activity_logs_v1'
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// In-memory cache synced with localStorage
let state = {
  products: getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  categories: getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  inventoryTransactions: getStorage<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  inquiries: getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES),
  customers: getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  contactMessages: getStorage<ContactMessage[]>(STORAGE_KEYS.CONTACTS, INITIAL_CONTACT_MESSAGES),
  settings: getStorage<CompanySettings>(STORAGE_KEYS.SETTINGS, INITIAL_COMPANY_SETTINGS),
  adminUsers: getStorage<AdminUser[]>(STORAGE_KEYS.USERS, INITIAL_ADMIN_USERS),
  currentUser: getStorage<AdminUser | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_ADMIN_USERS[0]),
  notifications: getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  activityLogs: getStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS)
};

// Event listeners for state changes
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const store = {
  getState() {
    return state;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Log activity
  logActivity(action: string, entity: ActivityLog['entity'], details: string) {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      entity,
      details,
      user: state.currentUser ? state.currentUser.name : 'Public Visitor',
      timestamp: new Date().toISOString()
    };
    state.activityLogs = [newLog, ...state.activityLogs].slice(0, 200);
    setStorage(STORAGE_KEYS.LOGS, state.activityLogs);
    notify();
  },

  // Notification helper
  addNotification(type: AppNotification['type'], title: string, message: string, link?: string) {
    const notif: AppNotification = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type,
      title,
      message,
      link,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    state.notifications = [notif, ...state.notifications];
    setStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
  },

  markNotificationRead(id: string) {
    state.notifications = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
  },

  clearAllNotifications() {
    state.notifications = [];
    setStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
  },

  // --- PRODUCT CRUD ---
  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.products = [newProduct, ...state.products];
    setStorage(STORAGE_KEYS.PRODUCTS, state.products);

    // Update category count
    this.recalculateCategoryCounts();

    // Opening inventory transaction if stock > 0
    if (newProduct.stockQuantity > 0) {
      this.recordStockMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        productCode: newProduct.code,
        movementType: 'Opening Stock',
        quantity: newProduct.stockQuantity,
        previousQuantity: 0,
        newQuantity: newProduct.stockQuantity,
        referenceNumber: 'INIT-' + newProduct.code,
        remarks: 'Initial stock recorded upon product creation',
        performedBy: state.currentUser ? state.currentUser.name : 'Admin',
        location: 'Factory Warehouse'
      }, false);
    }

    this.logActivity('Create Product', 'Product', `Created product: ${newProduct.name} (${newProduct.code})`);
    this.addNotification('system', 'New Product Added', `${newProduct.name} added to catalog.`);
    notify();
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>) {
    const existing = state.products.find((p) => p.id === id);
    if (!existing) return;

    state.products = state.products.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setStorage(STORAGE_KEYS.PRODUCTS, state.products);
    this.recalculateCategoryCounts();
    this.logActivity('Update Product', 'Product', `Updated product: ${existing.name} (${existing.code})`);
    notify();
  },

  deleteProduct(id: string) {
    const existing = state.products.find((p) => p.id === id);
    if (!existing) return;

    state.products = state.products.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTS, state.products);
    this.recalculateCategoryCounts();
    this.logActivity('Delete Product', 'Product', `Deleted product: ${existing.name} (${existing.code})`);
    notify();
  },

  bulkUpdateProductStatus(ids: string[], isActive: boolean) {
    state.products = state.products.map((p) =>
      ids.includes(p.id) ? { ...p, isActive, updatedAt: new Date().toISOString() } : p
    );
    setStorage(STORAGE_KEYS.PRODUCTS, state.products);
    this.logActivity('Bulk Update', 'Product', `Updated active status to ${isActive} for ${ids.length} products`);
    notify();
  },

  bulkDeleteProducts(ids: string[]) {
    state.products = state.products.filter((p) => !ids.includes(p.id));
    setStorage(STORAGE_KEYS.PRODUCTS, state.products);
    this.recalculateCategoryCounts();
    this.logActivity('Bulk Delete', 'Product', `Deleted ${ids.length} products`);
    notify();
  },

  // --- CATEGORY CRUD ---
  recalculateCategoryCounts() {
    state.categories = state.categories.map((cat) => {
      const count = state.products.filter((p) => p.category === cat.name).length;
      return { ...cat, productCount: count };
    });
    setStorage(STORAGE_KEYS.CATEGORIES, state.categories);
  },

  addCategory(catData: Omit<Category, 'id' | 'productCount'>) {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now(),
      productCount: 0
    };
    state.categories = [...state.categories, newCat];
    setStorage(STORAGE_KEYS.CATEGORIES, state.categories);
    this.logActivity('Create Category', 'Category', `Created category: ${newCat.name}`);
    notify();
    return newCat;
  },

  updateCategory(id: string, updates: Partial<Category>) {
    state.categories = state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setStorage(STORAGE_KEYS.CATEGORIES, state.categories);
    this.logActivity('Update Category', 'Category', `Updated category ID: ${id}`);
    notify();
  },

  deleteCategory(id: string): { success: boolean; message: string } {
    const target = state.categories.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Category not found.' };

    const productsInCat = state.products.filter((p) => p.category === target.name);
    if (productsInCat.length > 0) {
      return {
        success: false,
        message: `Cannot delete category "${target.name}". It still contains ${productsInCat.length} products. Reassign or delete them first.`
      };
    }

    state.categories = state.categories.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, state.categories);
    this.logActivity('Delete Category', 'Category', `Deleted category: ${target.name}`);
    notify();
    return { success: true, message: `Category "${target.name}" deleted successfully.` };
  },

  // --- INVENTORY MANAGEMENT ---
  recordStockMovement(
    params: {
      productId: string;
      productName: string;
      productCode: string;
      movementType: MovementType;
      quantity: number;
      previousQuantity: number;
      newQuantity: number;
      referenceNumber: string;
      remarks: string;
      performedBy: string;
      location?: string;
    },
    updateProductState = true
  ) {
    const newTx: InventoryTransaction = {
      ...params,
      id: 'tx-' + Date.now(),
      date: new Date().toISOString()
    };

    state.inventoryTransactions = [newTx, ...state.inventoryTransactions];
    setStorage(STORAGE_KEYS.TRANSACTIONS, state.inventoryTransactions);

    if (updateProductState) {
      const prod = state.products.find((p) => p.id === params.productId);
      if (prod) {
        let availability: Product['availabilityStatus'] = 'In Stock';
        if (params.newQuantity <= 0) {
          availability = 'Out of Stock';
        } else if (params.newQuantity <= prod.minStockLevel) {
          availability = 'Low Stock';
        }

        state.products = state.products.map((p) =>
          p.id === params.productId
            ? { ...p, stockQuantity: params.newQuantity, availabilityStatus: availability, updatedAt: new Date().toISOString() }
            : p
        );
        setStorage(STORAGE_KEYS.PRODUCTS, state.products);

        // Low stock notification
        if (params.newQuantity <= prod.minStockLevel && params.newQuantity > 0) {
          this.addNotification(
            'stock',
            `Low Stock Warning: ${prod.name}`,
            `Current stock: ${params.newQuantity} ${prod.unitOfMeasurement}. Threshold: ${prod.minStockLevel}.`,
            'inventory'
          );
        } else if (params.newQuantity <= 0) {
          this.addNotification(
            'stock',
            `Out of Stock: ${prod.name}`,
            `Product is now completely out of stock!`,
            'inventory'
          );
        }
      }
    }

    this.logActivity(
      'Inventory Movement',
      'Inventory',
      `${params.movementType}: ${params.quantity} units for ${params.productName} (Ref: ${params.referenceNumber})`
    );
    notify();
    return newTx;
  },

  // --- INQUIRY MANAGEMENT ---
  addInquiry(
    inquiryData: Omit<Inquiry, 'id' | 'inquiryNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ) {
    const year = new Date().getFullYear();
    const count = state.inquiries.length + 1;
    const inquiryNumber = `HMC-INQ-${year}-${String(count).padStart(3, '0')}`;

    const newInquiry: Inquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now(),
      inquiryNumber,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalNotes: []
    };

    state.inquiries = [newInquiry, ...state.inquiries];
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);

    // Sync / Upsert Customer record
    const existingCust = state.customers.find(
      (c) =>
        c.phone.replace(/[^0-9]/g, '') === newInquiry.phone.replace(/[^0-9]/g, '') ||
        (c.email && c.email.toLowerCase() === newInquiry.email.toLowerCase())
    );

    if (existingCust) {
      state.customers = state.customers.map((c) =>
        c.id === existingCust.id
          ? {
              ...c,
              totalInquiries: c.totalInquiries + 1,
              lastInquiryDate: new Date().toISOString().split('T')[0],
              name: newInquiry.customerName || c.name,
              company: newInquiry.companyName || c.company
            }
          : c
      );
    } else {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: newInquiry.customerName,
        company: newInquiry.companyName || 'Independent',
        phone: newInquiry.phone,
        email: newInquiry.email,
        address: newInquiry.address || '',
        category: 'Wholesaler',
        totalInquiries: 1,
        lastInquiryDate: new Date().toISOString().split('T')[0],
        notes: `Initial inquiry for ${newInquiry.productName}`
      };
      state.customers = [newCust, ...state.customers];
    }
    setStorage(STORAGE_KEYS.CUSTOMERS, state.customers);

    this.addNotification(
      'inquiry',
      `New Inquiry: ${newInquiry.inquiryNumber}`,
      `${newInquiry.customerName} inquired for ${newInquiry.requiredQuantity} ${newInquiry.unit} of ${newInquiry.productName}`,
      'inquiries'
    );
    this.logActivity('New Inquiry', 'Inquiry', `Inquiry ${inquiryNumber} received from ${newInquiry.customerName}`);
    notify();
    return newInquiry;
  },

  updateInquiryStatus(id: string, status: InquiryStatus, remarks?: string) {
    const existing = state.inquiries.find((inq) => inq.id === id);
    if (!existing) return;

    const notes = existing.internalNotes ? [...existing.internalNotes] : [];
    if (remarks) {
      notes.push(`[${new Date().toLocaleDateString()}] Status changed to ${status}: ${remarks}`);
    } else {
      notes.push(`[${new Date().toLocaleDateString()}] Status updated to ${status}`);
    }

    state.inquiries = state.inquiries.map((inq) =>
      inq.id === id
        ? {
            ...inq,
            status,
            internalNotes: notes,
            updatedAt: new Date().toISOString()
          }
        : inq
    );
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
    this.logActivity('Inquiry Status', 'Inquiry', `Inquiry ${existing.inquiryNumber} changed to ${status}`);
    notify();
  },

  assignInquiryStaff(id: string, staffName: string) {
    state.inquiries = state.inquiries.map((inq) =>
      inq.id === id ? { ...inq, assignedStaff: staffName, updatedAt: new Date().toISOString() } : inq
    );
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
    notify();
  },

  addInquiryNote(id: string, note: string) {
    state.inquiries = state.inquiries.map((inq) => {
      if (inq.id === id) {
        const notes = inq.internalNotes ? [...inq.internalNotes] : [];
        notes.push(`[${new Date().toLocaleString()}] ${note}`);
        return { ...inq, internalNotes: notes, updatedAt: new Date().toISOString() };
      }
      return inq;
    });
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
    notify();
  },

  setInquiryFollowUp(id: string, date: string) {
    state.inquiries = state.inquiries.map((inq) =>
      inq.id === id ? { ...inq, followUpDate: date, updatedAt: new Date().toISOString() } : inq
    );
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
    notify();
  },

  deleteInquiry(id: string) {
    const target = state.inquiries.find((inq) => inq.id === id);
    if (!target) return;
    state.inquiries = state.inquiries.filter((inq) => inq.id !== id);
    setStorage(STORAGE_KEYS.INQUIRIES, state.inquiries);
    this.logActivity('Delete Inquiry', 'Inquiry', `Deleted inquiry ${target.inquiryNumber}`);
    notify();
  },

  // --- CONTACT MESSAGES ---
  addContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    state.contactMessages = [newMsg, ...state.contactMessages];
    setStorage(STORAGE_KEYS.CONTACTS, state.contactMessages);

    this.addNotification(
      'contact',
      `Contact Message from ${newMsg.name}`,
      newMsg.subject || 'New message on website contact form',
      'inquiries'
    );
    this.logActivity('Contact Form', 'Inquiry', `Message received from ${newMsg.name} (${newMsg.email})`);
    notify();
    return newMsg;
  },

  markContactRead(id: string) {
    state.contactMessages = state.contactMessages.map((m) => (m.id === id ? { ...m, isRead: true } : m));
    setStorage(STORAGE_KEYS.CONTACTS, state.contactMessages);
    notify();
  },

  deleteContactMessage(id: string) {
    state.contactMessages = state.contactMessages.filter((m) => m.id !== id);
    setStorage(STORAGE_KEYS.CONTACTS, state.contactMessages);
    notify();
  },

  // --- CUSTOMER MANAGEMENT ---
  updateCustomer(id: string, updates: Partial<Customer>) {
    state.customers = state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
    this.logActivity('Update Customer', 'Inquiry', `Updated customer ID ${id}`);
    notify();
  },

  toggleCustomerBlock(id: string) {
    state.customers = state.customers.map((c) =>
      c.id === id ? { ...c, isBlocked: !c.isBlocked } : c
    );
    setStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
    notify();
  },

  // --- SETTINGS ---
  updateSettings(updates: Partial<CompanySettings>) {
    state.settings = { ...state.settings, ...updates };
    setStorage(STORAGE_KEYS.SETTINGS, state.settings);
    this.logActivity('Update Settings', 'Settings', 'Company website settings updated');
    notify();
  },

  // --- AUTH & ROLES ---
  login(email: string, role: UserRole = 'Super Admin') {
    const existing = state.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user: AdminUser = existing || {
      id: 'usr-' + Date.now(),
      email,
      name: email.split('@')[0].toUpperCase(),
      role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    state.currentUser = user;
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.logActivity('User Login', 'Auth', `${user.name} logged in as ${user.role}`);
    notify();
    return user;
  },

  switchRole(role: UserRole) {
    if (!state.currentUser) return;
    state.currentUser = { ...state.currentUser, role };
    setStorage(STORAGE_KEYS.CURRENT_USER, state.currentUser);
    this.logActivity('Role Switch', 'Auth', `Switched active role to ${role}`);
    notify();
  },

  logout() {
    state.currentUser = null;
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    notify();
  },

  addAdminUser(userData: Omit<AdminUser, 'id' | 'lastLogin'>) {
    const newUser: AdminUser = {
      ...userData,
      id: 'usr-' + Date.now(),
      lastLogin: 'Never'
    };
    state.adminUsers = [...state.adminUsers, newUser];
    setStorage(STORAGE_KEYS.USERS, state.adminUsers);
    this.logActivity('Add User', 'Auth', `Added new team user ${newUser.name} (${newUser.role})`);
    notify();
    return newUser;
  },

  updateAdminUser(id: string, updates: Partial<AdminUser>) {
    state.adminUsers = state.adminUsers.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setStorage(STORAGE_KEYS.USERS, state.adminUsers);
    notify();
  },

  deleteAdminUser(id: string) {
    state.adminUsers = state.adminUsers.filter((u) => u.id !== id);
    setStorage(STORAGE_KEYS.USERS, state.adminUsers);
    notify();
  },

  // Reset demo
  resetToDemoData() {
    state = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      inventoryTransactions: INITIAL_TRANSACTIONS,
      inquiries: INITIAL_INQUIRIES,
      customers: INITIAL_CUSTOMERS,
      contactMessages: INITIAL_CONTACT_MESSAGES,
      settings: INITIAL_COMPANY_SETTINGS,
      adminUsers: INITIAL_ADMIN_USERS,
      currentUser: INITIAL_ADMIN_USERS[0],
      notifications: INITIAL_NOTIFICATIONS,
      activityLogs: INITIAL_ACTIVITY_LOGS
    };
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    notify();
  },

  // --- WHATSAPP HELPER ---
  getWhatsAppUrl(rawPhone: string, text: string): string {
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text.trim());
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  },

  generateProductWhatsAppUrl(product: Product, customNote?: string): string {
    const waNumber = state.settings.whatsappNumber;
    const lines = [
      `*Product Inquiry - Hulas Metal Crafts Ltd.*`,
      `• *Product:* ${product.name}`,
      `• *Product Code/SKU:* ${product.code}`,
      `• *Category:* ${product.category} (${product.subcategory || 'General'})`,
      product.grade ? `• *Grade:* ${product.grade}` : '',
      product.gauge ? `• *Gauge:* ${product.gauge}` : '',
      product.pipeSize ? `• *Size/OD:* ${product.pipeSize}` : (product.size ? `• *Size:* ${product.size}` : ''),
      product.thickness ? `• *Thickness:* ${product.thickness}` : '',
      customNote ? `\n*Customer Note:* ${customNote}` : '',
      `\nPlease share quotation, MOQ, and delivery timeline to our location.`
    ].filter(Boolean);

    return this.getWhatsAppUrl(waNumber, lines.join('\n'));
  }
};

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return store.getState();
}
