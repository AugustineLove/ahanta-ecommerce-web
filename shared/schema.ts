import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export const COLLECTIONS = {
  USERS: "users",
  VENDORS: "vendors",
  PRODUCTS: "products",
  DRIVERS: "drivers",
  ORDERS: "orders",
} as const;

// Base types with Firestore timestamps
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User types
export interface User extends FirestoreDocument {
  email: string;
  role: "vendor" | "driver";
  onboardingComplete: boolean;
}

export interface UserCreate {
  email: string;
  role: "vendor" | "driver";
  onboardingComplete?: boolean;
}

// Vendor types
export interface Vendor extends FirestoreDocument {
  userId: string;
  brandName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating: number;
  deliveryTime: string;
  isPopular: boolean;
  role: string;
  onboardingComplete: boolean;
  email: string;
  location: string;
  area: string;
}

export interface VendorCreate {
  userId: string;
  brandName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating?: number;
  deliveryTime?: string;
  isPopular?: boolean;
}

export interface Hotel extends FirestoreDocument {
  userId: string;
  hotelName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating: number;
  deliveryTime: string;
  isPopular: boolean;
  role: string;
  onboardingComplete: boolean;
  email: string;
  location: string;
  area: string;
}

export interface HotelCreate {
  userId: string;
  hotelName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating?: number;
  deliveryTime?: string;
  isPopular?: boolean;
}

export interface Profession extends FirestoreDocument {
  userId: string;
  brandName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating: number;
  deliveryTime: string;
  isPopular: boolean;
  role: string;
  onboardingComplete: boolean;
  email: string;
  location: string;
  area: string;
}

export interface ProfessionCreate {
  userId: string;
  brandName: string;
  category: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating?: number;
  deliveryTime?: string;
  isPopular?: boolean;
}

// Product types
export interface ProductAddon {
  name: string;
  price: number;
}

export interface ProductCustomOptions {
  addons?: ProductAddon[];
}

export interface Product extends FirestoreDocument {
  vendorId: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  customOptions?: ProductCustomOptions;
}

export interface ProductCreate {
  vendorId: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  customOptions?: ProductCustomOptions;
}

// Driver types
export interface Driver extends FirestoreDocument {
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: "bike" | "keke" | "car" | "van";
  vehicleNumber: string;
  vehicleColor: string;
  isAvailable: boolean;
  totalEarnings: number;
  role: string;
  onboardingComplete: boolean;
  email: string;
  location: string;
}

export interface DriverCreate {
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: "bike" | "keke" | "car" | "van";
  vehicleNumber: string;
  vehicleColor: string;
  isAvailable?: boolean;
  totalEarnings?: number;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  addons?: ProductAddon[];
}

export interface Order extends FirestoreDocument {
  vendorId: string;
  driverId?: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "delivering" | "completed" | "cancelled";
}

export interface OrderCreate {
  vendorId: string;
  driverId?: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status?: "pending" | "preparing" | "ready" | "delivering" | "completed" | "cancelled";
}

// Zod Schemas for validation

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["vendor", "driver", "hotel_manager", "skilled_professional"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["driver", "vendor", "hotel_manager", "skilled_professional"]),
});

// Vendor schemas
export const vendorBusinessInfoSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  location: z.string().min(1, "Please enter your location"),
  area: z.string().min(1, "Please enter your area"),
  workingHours: z.record(z.string()).optional(),
});
export const hotelBusinessInfoSchema = z.object({
  hotelName: z.string().min(2, "Hotel name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  location: z.string().min(1, "Please enter your location"),
  area: z.string().min(1, "Please enter your area"),
  workingHours: z.record(z.string()).optional(),
});

export const vendorBrandingSchema = z.object({
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
});

export const vendorCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  deliveryTime: z.string().default("15-30 min"),
  isPopular: z.boolean().default(false),
});

// Product schemas
export const productAddonSchema = z.object({
  name: z.string().min(1, "Addon name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
});

export const productCustomOptionsSchema = z.object({
  addons: z.array(productAddonSchema).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  inStock: z.boolean().default(true),
  customOptions: productCustomOptionsSchema.optional(),
});

export const productCreateSchema = productSchema.extend({
  vendorId: z.string().min(1, "Vendor ID is required"),
});

// Driver schemas
export const driverPersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const driverVehicleInfoSchema = z.object({
  vehicleType: z.enum(["bike", "keke", "car", "van"]),
  businessNumber: z.string().min(1, "Vehicle number is required"),
  vehicleColor: z.string().min(1, "Please select a vehicle color"),
  description: z.string().min(5, "Please enter description"),
  label: z.string().min(0, "Please enter your vehicle label"),
   services: z
    .array(z.string())
    .min(1, "Please select at least one service"),
  profession: z.string().min(2, "Please select profession title"),
});

export const driverCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  vehicleType: z.enum(["bike", "keke", "car", "van"]),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleColor: z.string().min(1, "Please select a vehicle color"),
  isAvailable: z.boolean().default(true),
  totalEarnings: z.number().min(0).default(0),
});

// Order schemas
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be 0 or greater"),
  addons: z.array(productAddonSchema).optional(),
});

export const orderCreateSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  driverId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().min(1, "Customer address is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0.01, "Total amount must be greater than 0"),
  status: z.enum(["pending", "preparing", "ready", "delivering", "completed", "cancelled"]).default("pending"),
});

// Form types
export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type VendorBusinessInfo = z.infer<typeof vendorBusinessInfoSchema>;
export type HotelBusinessInfo = z.infer<typeof hotelBusinessInfoSchema>;
export type VendorBranding = z.infer<typeof vendorBrandingSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type DriverPersonalInfo = z.infer<typeof driverPersonalInfoSchema>;
export type DriverVehicleInfo = z.infer<typeof driverVehicleInfoSchema>;