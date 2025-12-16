import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  vendorBusinessInfoSchema, 
  productSchema,
  type VendorBusinessInfo, 
  type ProductForm,
  type Product
} from "@shared/schema";
import { 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Package
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const categories = [
  "Fast Food",
  "Grocery",
  "Bakery",
  "Pharmacy",
  "Electronics",
  "Fashion",
  "Restaurant",
  "Other"
];

const productCategories = [
  "Packaged",
  "Fresh",
  "Customizable",
  "Beverages",
  "Snacks",
  "Other"
];

const sampleProducts: Omit<Product, "id" | "vendorId">[] = [
  {
    name: "Fresh Bread",
    imageUrl: "/api/placeholder/bread",
    price: 15.00,
    category: "Packaged",
    description: "Freshly baked daily",
    inStock: true,
    customOptions: null
  },
  {
    name: "Custom Cake",
    imageUrl: "/api/placeholder/cake",
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
];

interface Addon {
  name: string;
  price: number;
}

interface LocalProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  customOptions?: { addons?: Addon[] } | null;
}

export default function VendorOnboarding() {
  const [, navigate] = useLocation();
  const { user, setVendor, updateUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<VendorBusinessInfo | null>(null);
  const [branding, setBranding] = useState({ logoUrl: "", coverUrl: "" });
  const [products, setProducts] = useState<LocalProduct[]>(
    sampleProducts.map((p, i) => ({ ...p, id: `sample-${i}` }))
  );
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);

  const businessForm = useForm<VendorBusinessInfo>({
    resolver: zodResolver(vendorBusinessInfoSchema),
    defaultValues: {
      brandName: "",
      category: "",
      description: "",
    },
  });

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

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/vendors", {
        userId: user?.id,
        ...businessInfo,
        ...branding,
        products: products.map(({ id, ...p }) => p),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVendor(data.vendor);
      updateUser({ onboardingComplete: true });
      toast({
        title: "Onboarding complete!",
        description: "Your store is now live. Welcome to DeliverEase!",
      });
      navigate("/dashboard/vendor");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding.",
        variant: "destructive",
      });
    },
  });

  const handleBusinessInfoSubmit = (data: VendorBusinessInfo) => {
    setBusinessInfo(data);
    setStep(2);
  };

  const handleBrandingSubmit = () => {
    setStep(3);
  };

  const handleAddProduct = (data: ProductForm) => {
    const newProduct: LocalProduct = {
      id: `new-${Date.now()}`,
      ...data,
      customOptions: addons.length > 0 ? { addons } : null,
    };
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
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

  const steps = [
    { number: 1, title: "Business Info" },
    { number: 2, title: "Branding" },
    { number: 3, title: "Products" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DeliverEase</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                        step > s.number
                          ? "bg-primary text-primary-foreground"
                          : step === s.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`step-indicator-${s.number}`}
                    >
                      {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${
                      step >= s.number ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      step > s.number ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card className="border-ash dark:border-border" data-testid="card-business-info">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Tell us about your business</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...businessForm}>
                  <form onSubmit={businessForm.handleSubmit(handleBusinessInfoSubmit)} className="space-y-6">
                    <FormField
                      control={businessForm.control}
                      name="brandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., SHALOM FAST FOOD"
                              data-testid="input-brand-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat} data-testid={`option-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
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
                      control={businessForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell customers about your business..."
                              className="resize-none"
                              rows={4}
                              data-testid="textarea-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" className="gap-2" data-testid="button-next-step-1">
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-ash dark:border-border" data-testid="card-branding">
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Upload your brand assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  <div className="border-2 border-dashed border-ash dark:border-border rounded-lg p-8 text-center">
                    {branding.logoUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranding({ ...branding, logoUrl: "" })}
                          data-testid="button-remove-logo"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop or click to upload
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranding({ ...branding, logoUrl: "/api/placeholder/logo" })}
                          data-testid="button-upload-logo"
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cover Image</label>
                  <div className="border-2 border-dashed border-ash dark:border-border rounded-lg p-8 text-center">
                    {branding.coverUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranding({ ...branding, coverUrl: "" })}
                          data-testid="button-remove-cover"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop or click to upload
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranding({ ...branding, coverUrl: "/api/placeholder/cover" })}
                          data-testid="button-upload-cover"
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2" data-testid="button-back-step-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleBrandingSubmit} className="gap-2" data-testid="button-next-step-2">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-ash dark:border-border" data-testid="card-products">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Add products to your store</CardDescription>
                </div>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" onClick={() => {
                      setEditingProduct(null);
                      productForm.reset();
                      setAddons([]);
                    }} data-testid="button-add-product">
                      <Plus className="h-4 w-4" />
                      Add Product
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
                                <p className="text-sm text-muted-foreground">Product available for purchase</p>
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
                            <label className="text-sm font-medium">Addons (Optional)</label>
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
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No products yet. Add your first product!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {products.map((product) => (
                      <Card key={product.id} className="border-ash dark:border-border" data-testid={`card-product-${product.id}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium truncate">{product.name}</h4>
                                  <p className="text-sm text-primary font-semibold">${product.price.toFixed(2)}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditProduct(product)}
                                    data-testid={`button-edit-product-${product.id}`}
                                  >
                                    <span className="sr-only">Edit</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    data-testid={`button-delete-product-${product.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  product.inStock
                                    ? "bg-success/10 text-success"
                                    : "bg-destructive/10 text-destructive"
                                }`}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                                {product.customOptions?.addons && product.customOptions.addons.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{product.customOptions.addons.length} addons
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2" data-testid="button-back-step-3">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => completeOnboardingMutation.mutate()}
                    disabled={products.length === 0 || completeOnboardingMutation.isPending}
                    className="gap-2"
                    data-testid="button-complete-onboarding"
                  >
                    {completeOnboardingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
