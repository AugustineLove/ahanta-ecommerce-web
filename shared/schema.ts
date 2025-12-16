import { pgTable, text, varchar, boolean, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["vendor", "driver"] }).notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false),
});

export const vendors = pgTable("vendors", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  brandName: text("brand_name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  rating: real("rating").default(0),
  deliveryTime: text("delivery_time").default("15-30 min"),
  isPopular: boolean("is_popular").default(false),
});

export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  vendorId: varchar("vendor_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  customOptions: jsonb("custom_options"),
});

export const drivers = pgTable("drivers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  vehicleType: text("vehicle_type", { enum: ["bike", "keke", "car", "van"] }).notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  isAvailable: boolean("is_available").default(true),
  totalEarnings: real("total_earnings").default(0),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  vendorId: varchar("vendor_id", { length: 36 }).notNull(),
  driverId: varchar("driver_id", { length: 36 }),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  items: jsonb("items").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: ["pending", "preparing", "ready", "delivering", "completed", "cancelled"] }).default("pending"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Custom option types
export interface ProductAddon {
  name: string;
  price: number;
}

export interface ProductCustomOptions {
  addons?: ProductAddon[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  addons?: ProductAddon[];
}

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["vendor", "driver"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Onboarding schemas
export const vendorBusinessInfoSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
});

export const vendorBrandingSchema = z.object({
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  inStock: z.boolean().default(true),
  customOptions: z.object({
    addons: z.array(z.object({
      name: z.string(),
      price: z.number(),
    })).optional(),
  }).optional(),
});

export const driverPersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const driverVehicleInfoSchema = z.object({
  vehicleType: z.enum(["bike", "keke", "car", "van"]),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleColor: z.string().min(1, "Please select a vehicle color"),
});

export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type VendorBusinessInfo = z.infer<typeof vendorBusinessInfoSchema>;
export type VendorBranding = z.infer<typeof vendorBrandingSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type DriverPersonalInfo = z.infer<typeof driverPersonalInfoSchema>;
export type DriverVehicleInfo = z.infer<typeof driverVehicleInfoSchema>;
