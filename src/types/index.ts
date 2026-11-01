export type SSGrade = 'SS 304' | 'SS 202' | 'SS 201' | 'SS 304L' | 'SS 316' | 'SS 316L' | 'SS 410' | 'SS 430' | 'Other';

export type ProductCategoryType = 'SS Utensils' | 'SS Pipes' | 'Industrial Fittings' | 'Custom Metal Craft';

export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Made to Order' | 'Discontinued';

export interface CustomSpecification {
  id: string;
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  code: string; // SKU
  category: ProductCategoryType;
  subcategory: string;
  image: string;
  galleryImages: string[];
  pdfCatalogueUrl?: string;
  description: string;
  technicalSpecs?: string;
  customSpecs: CustomSpecification[];
  
  // Pricing & Display
  price?: number;
  showPrice?: boolean;
  isFeatured: boolean;
  isActive: boolean;
  displayStatus: 'Published' | 'Draft' | 'Archived';
  availabilityStatus: AvailabilityStatus;
  
  // Stock
  stockQuantity: number;
  minStockLevel: number;
  minimumOrderQuantity: number;
  unitOfMeasurement: string; // Pcs, Sets, Meters, Bundles, MT, Kg
  
  // Specific to SS Utensils
  size?: string;
  gauge?: string; // 18G, 20G, 22G, 24G
  material?: string;
  grade?: SSGrade;
  thickness?: string; // e.g., 0.8mm, 1.2mm
  diameter?: string; // e.g., 220mm
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
  capacity?: string; // e.g., 5 Litres, 12 Litres
  finish?: string; // Mirror Polish, Matte, Satin, Hammered
  shape?: string; // Round, Oval, Square, Deep
  colour?: string;
  packagingDetails?: string;

  // Specific to SS Pipes
  pipeSize?: string; // e.g., 1/2" to 12"
  outerDiameter?: string; // OD e.g., 25.4mm
  innerDiameter?: string; // ID
  pipeLength?: string; // e.g., 6 Meters
  surfaceFinish?: string; // 2B, BA, No.4, Hairline, 600# Mirror
  pipeShape?: 'Round' | 'Square' | 'Rectangular' | 'Oval';
  pipeType?: 'Welded (ERW/TIG)' | 'Seamless (Cold Drawn)' | 'Decorative Tube' | 'Sanitary Tubing';
  standard?: string; // ASTM A554, ASTM A312, DIN 11850, JIS G3459
  weightPerMeter?: string; // e.g., 1.45 kg/m

  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: ProductCategoryType | string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  subcategories: string[];
  productCount?: number;
}

export type MovementType = 
  | 'Opening Stock'
  | 'Stock Addition'
  | 'Stock Deduction'
  | 'Stock Adjustment'
  | 'Purchase Entry'
  | 'Sales / Delivery'
  | 'Damaged Stock'
  | 'Returned Stock'
  | 'Location Transfer'
  | 'Stock Correction';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
  referenceNumber: string;
  remarks: string;
  performedBy: string;
  location?: string;
}

export type InquiryStatus = 
  | 'New'
  | 'Pending'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Negotiation'
  | 'Converted'
  | 'Closed'
  | 'Rejected';

export interface Inquiry {
  id: string;
  inquiryNumber: string; // e.g., HMC-INQ-2026-001
  customerName: string;
  companyName?: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  address?: string;
  
  // Associated Product
  productId?: string;
  productName: string;
  productCode?: string;
  category?: string;
  
  // Requirements
  requiredSize?: string;
  requiredGrade?: string;
  requiredThickness?: string;
  gauge?: string;
  requiredQuantity: number;
  unit: string;
  message: string;
  preferredContactMethod: 'WhatsApp' | 'Phone Call' | 'Email';
  
  // Admin workflow
  status: InquiryStatus;
  assignedStaff?: string;
  internalNotes?: string[];
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address?: string;
  category: 'Wholesaler' | 'Industrial Contractor' | 'Fabricator' | 'Retailer' | 'Institutional Buyer';
  totalInquiries: number;
  lastInquiryDate: string;
  notes?: string;
  isBlocked?: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: 'Product' | 'Category' | 'Inventory' | 'Inquiry' | 'Settings' | 'Auth';
  details: string;
  user: string;
  timestamp: string;
}

export type NotificationType = 'inquiry' | 'stock' | 'contact' | 'followup' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  headOfficeAddress: string;
  factoryAddress: string;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  salesEmail: string;
  whatsappNumber: string; // e.g., "9779801234567"
  businessHours: string;
  googleMapsEmbedUrl: string;
  
  // Public Display
  showPricesGlobally: boolean;
  allowPublicInquiries: boolean;
  
  // Hero & Content
  heroHeadline: string;
  heroSubheading: string;
  heroBannerImage: string;
  
  // About Content
  aboutHistory: string;
  aboutVision: string;
  aboutMission: string;
  aboutValues: string[];
  aboutQualityCommitment: string;
  aboutGallery: string[];
  
  // Social links
  facebookUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export type UserRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Inventory Manager'
  | 'Sales Manager'
  | 'Staff / Viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  lastLogin: string;
  isActive: boolean;
}
