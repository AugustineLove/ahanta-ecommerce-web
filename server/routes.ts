import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  vendorBusinessInfoSchema,
  driverPersonalInfoSchema,
  driverVehicleInfoSchema,
  productSchema
} from "@shared/schema";

const signUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["vendor", "driver"])
});

const signInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const vendorCreateSchema = z.object({
  userId: z.string().min(1),
  brandName: z.string().min(2),
  category: z.string().min(1),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  products: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    category: z.string().min(1),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    inStock: z.boolean().optional(),
    customOptions: z.any().optional().nullable()
  })).optional()
});

const driverCreateSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(2),
  phoneNumber: z.string().min(10),
  vehicleType: z.enum(["bike", "keke", "car", "van"]),
  vehicleNumber: z.string().min(1),
  vehicleColor: z.string().min(1)
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parseResult = signUpRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: parseResult.error.errors[0]?.message || "Invalid request data" });
      }
      
      const { email, password, role } = parseResult.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser({
        email,
        password,
        role,
        onboardingComplete: false
      });
      
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const parseResult = signInRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: parseResult.error.errors[0]?.message || "Invalid request data" });
      }
      
      const { email, password } = parseResult.data;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const { password: _, ...safeUser } = user;
      
      let vendor = null;
      let driver = null;
      
      if (user.role === "vendor") {
        vendor = await storage.getVendorByUserId(user.id);
      } else if (user.role === "driver") {
        driver = await storage.getDriverByUserId(user.id);
      }
      
      res.json({ user: safeUser, vendor, driver });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });
  
  app.post("/api/vendors", async (req, res) => {
    try {
      const parseResult = vendorCreateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: parseResult.error.errors[0]?.message || "Invalid vendor data" });
      }
      
      const { userId, brandName, category, description, logoUrl, coverUrl, products } = parseResult.data;
      
      const vendor = await storage.createVendor({
        userId,
        brandName,
        category,
        description: description || null,
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        rating: 4.8,
        deliveryTime: "15-20 min",
        isPopular: false
      });
      
      if (products && Array.isArray(products)) {
        for (const product of products) {
          await storage.createProduct({
            vendorId: vendor.id,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || null,
            imageUrl: product.imageUrl || null,
            inStock: product.inStock ?? true,
            customOptions: product.customOptions || null
          });
        }
      }
      
      await storage.updateUser(userId, { onboardingComplete: true });
      
      res.json({ vendor });
    } catch (error) {
      console.error("Create vendor error:", error);
      res.status(500).json({ message: "Failed to create vendor profile" });
    }
  });
  
  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ vendor });
    } catch (error) {
      console.error("Get vendor error:", error);
      res.status(500).json({ message: "Failed to get vendor" });
    }
  });
  
  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ vendor });
    } catch (error) {
      console.error("Update vendor error:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  app.get("/api/vendors/:vendorId/products", async (req, res) => {
    try {
      const products = await storage.getProductsByVendor(req.params.vendorId);
      res.json({ products });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json({ product });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ product });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  app.post("/api/drivers", async (req, res) => {
    try {
      const parseResult = driverCreateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: parseResult.error.errors[0]?.message || "Invalid driver data" });
      }
      
      const { userId, fullName, phoneNumber, vehicleType, vehicleNumber, vehicleColor } = parseResult.data;
      
      const driver = await storage.createDriver({
        userId,
        fullName,
        phoneNumber,
        vehicleType,
        vehicleNumber,
        vehicleColor,
        isAvailable: true,
        totalEarnings: 0
      });
      
      await storage.updateUser(userId, { onboardingComplete: true });
      
      res.json({ driver });
    } catch (error) {
      console.error("Create driver error:", error);
      res.status(500).json({ message: "Failed to create driver profile" });
    }
  });
  
  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(req.params.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json({ driver });
    } catch (error) {
      console.error("Get driver error:", error);
      res.status(500).json({ message: "Failed to get driver" });
    }
  });
  
  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.updateDriver(req.params.id, req.body);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json({ driver });
    } catch (error) {
      console.error("Update driver error:", error);
      res.status(500).json({ message: "Failed to update driver" });
    }
  });
  
  app.get("/api/vendors/:vendorId/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByVendor(req.params.vendorId);
      res.json({ orders });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  app.get("/api/drivers/:driverId/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByDriver(req.params.driverId);
      res.json({ orders });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.json({ order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ order });
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  return httpServer;
}
