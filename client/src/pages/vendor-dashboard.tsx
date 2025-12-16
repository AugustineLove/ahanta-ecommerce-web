import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Plus,
  Trash2,
  LogOut,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductForm } from "@shared/schema";

interface LocalProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  customOptions?: { addons?: { name: string; price: number }[] } | null;
}

interface MockOrder {
  id: string;
  customerName: string;
  items: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  time: string;
}

const productCategories = [
  "Packaged",
  "Fresh",
  "Customizable",
  "Beverages",
  "Snacks",
  "Other"
];

const mockOrders: MockOrder[] = [
  { id: "ORD-001", customerName: "Chioma Adebayo", items: "2x Fresh Bread, 1x Custom Cake", total: 110.00, status: "pending", time: "5 mins ago" },
  { id: "ORD-002", customerName: "Emmanuel Obi", items: "3x Fresh Bread", total: 45.00, status: "preparing", time: "15 mins ago" },
  { id: "ORD-003", customerName: "Grace Nwosu", items: "1x Custom Cake with Extra Cream", total: 90.00, status: "ready", time: "25 mins ago" },
  { id: "ORD-004", customerName: "Daniel Eze", items: "4x Fresh Bread", total: 60.00, status: "completed", time: "1 hour ago" },
];

export default function VendorDashboard() {
  const [, navigate] = useLocation();
  const { user, vendor, logout } = useAuth();
  const { toast } = useToast();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [addons, setAddons] = useState<{ name: string; price: number }[]>([]);
  
  const [products, setProducts] = useState<LocalProduct[]>([
    {
      id: "1",
      name: "Fresh Bread",
      price: 15.00,
      category: "Packaged",
      description: "Freshly baked daily",
      inStock: true,
      customOptions: null
    },
    {
      id: "2",
      name: "Custom Cake",
      price: 80.00,
      category: "Customizable",
      description: "Customizable cake for special occasions",
      inStock: true,
      customOptions: {
        addons: [
          { name: "Extra Cream", price: 10.0 },
          { name: "Chocolate Topping", price: 15.0 }
        ]
      }
    }
  ]);

  const [orders, setOrders] = useState<MockOrder[]>(mockOrders);

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      category: "",
      description: "",
      imageUrl: "",
      inStock: true,
    },
  });

  const stats = [
    { 
      title: "Total Products", 
      value: products.length, 
      icon: Package, 
      color: "text-primary",
      bgColor: "bg-primary/10" 
    },
    { 
      title: "Active Orders", 
      value: orders.filter(o => o.status !== "completed").length, 
      icon: ShoppingCart, 
      color: "text-accent",
      bgColor: "bg-accent/10" 
    },
    { 
      title: "Total Revenue", 
      value: `$${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-success",
      bgColor: "bg-success/10" 
    },
    { 
      title: "Rating", 
      value: vendor?.rating || 4.8, 
      icon: Star, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10" 
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
  };

  const handleAddProduct = (data: ProductForm) => {
    const newProduct: LocalProduct = {
      id: editingProduct?.id || `new-${Date.now()}`,
      ...data,
      customOptions: addons.length > 0 ? { addons } : null,
    };
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      toast({ title: "Product updated successfully" });
    } else {
      setProducts([...products, newProduct]);
      toast({ title: "Product added successfully" });
    }
    
    productForm.reset();
    setAddons([]);
    setEditingProduct(null);
    setIsProductDialogOpen(false);
  };

  const handleEditProduct = (product: LocalProduct) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      inStock: product.inStock,
    });
    setAddons(product.customOptions?.addons || []);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast({ title: "Product deleted" });
  };

  const toggleProductStock = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    ));
  };

  const updateOrderStatus = (orderId: string, newStatus: MockOrder["status"]) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast({ title: `Order ${orderId} updated to ${newStatus}` });
  };

  const getStatusColor = (status: MockOrder["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "preparing": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "ready": return "bg-primary/10 text-primary";
      case "completed": return "bg-success/10 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const addAddon = () => {
    setAddons([...addons, { name: "", price: 0 }]);
  };

  const updateAddon = (index: number, field: "name" | "price", value: string | number) => {
    const newAddons = [...addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    setAddons(newAddons);
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DeliverEase</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" data-testid="text-vendor-name">{vendor?.brandName || "Your Store"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your store.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-ash dark:border-border" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-ash dark:border-border" data-testid="card-products">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1" onClick={() => {
                    setEditingProduct(null);
                    productForm.reset();
                    setAddons([]);
                  }} data-testid="button-add-product">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleAddProduct)} className="space-y-4">
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Fresh Bread" data-testid="input-product-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-product-price"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productCategories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your product..."
                                className="resize-none"
                                rows={2}
                                data-testid="textarea-product-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-ash dark:border-border p-3">
                            <div>
                              <FormLabel className="text-base">In Stock</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-in-stock"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Addons</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addAddon}
                            data-testid="button-add-addon"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {addons.map((addon, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="Addon name"
                              value={addon.name}
                              onChange={(e) => updateAddon(index, "name", e.target.value)}
                              className="flex-1"
                              data-testid={`input-addon-name-${index}`}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={addon.price || ""}
                              onChange={(e) => updateAddon(index, "price", parseFloat(e.target.value) || 0)}
                              className="w-24"
                              data-testid={`input-addon-price-${index}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAddon(index)}
                              data-testid={`button-remove-addon-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button type="submit" className="w-full" data-testid="button-save-product">
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-ash dark:border-border"
                    data-testid={`product-row-${product.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-primary font-semibold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={product.inStock}
                        onCheckedChange={() => toggleProductStock(product.id)}
                        data-testid={`switch-stock-${product.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-ash dark:border-border" data-testid="card-orders">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage incoming orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-lg border border-ash dark:border-border"
                    data-testid={`order-row-${order.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.id}</p>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <p className="font-semibold text-primary">${order.total.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{order.items}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {order.time}
                      </div>
                      {order.status !== "completed" && (
                        <Select 
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as MockOrder["status"])}
                        >
                          <SelectTrigger className="w-32 h-8" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-ash dark:border-border" data-testid="card-earnings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Earnings Overview
            </CardTitle>
            <CardDescription>Your revenue performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-primary">$110.00</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from yesterday
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-primary">$892.50</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% from last week
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-primary">$3,245.00</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +15% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
