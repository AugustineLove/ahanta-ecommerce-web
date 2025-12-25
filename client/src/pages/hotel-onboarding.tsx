import { useRef, useState } from "react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  vendorBusinessInfoSchema, 
  productSchema,
  type VendorBusinessInfo, 
  type ProductForm,
  type Product,
  HotelBusinessInfo,
  hotelBusinessInfoSchema
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
  Package,
  Clock,
  Copy
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { addDoc, collection, doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/firebase_auth";
import { auth, db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Label } from "recharts";

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

type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

type HourField = 'open' | 'close' | 'closed';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

type WorkingHours = Record<Day, DayHours>;

type ToastType = 'success' | 'error' | 'info';

const DAYS= [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];


const sampleProducts: Omit<Product, "id" | "vendorId">[] = [
  {
    name: "Fresh Bread",
    imageUrl: "/api/placeholder/bread",
    price: 15.00,
    category: "Packaged",
    description: "Freshly baked daily",
    inStock: true,
    customOptions: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
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
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
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

export default function HotelOnboarding() {
  const [, navigate] = useLocation();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<HotelBusinessInfo | null>(null);
  const [branding, setBranding] = useState({ logoUrl: "", coverUrl: "" });
  const [products, setProducts] = useState<LocalProduct[]>(
    sampleProducts.map((p, i) => ({ ...p, id: `sample-${i}` }))
  );
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingUrls, setIsUploadingUrls] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [sameHoursAllDays, setSameHoursAllDays] = useState(false);
  const [workingHours, setWorkingHours] = useState({
    Monday: { open: '09:00', close: '17:00', closed: false },
    Tuesday: { open: '09:00', close: '17:00', closed: false },
    Wednesday: { open: '09:00', close: '17:00', closed: false },
    Thursday: { open: '09:00', close: '17:00', closed: false },
    Friday: { open: '09:00', close: '17:00', closed: false },
    Saturday: { open: '10:00', close: '15:00', closed: false },
    Sunday: { open: '', close: '', closed: true },
  });

  const businessForm = useForm<HotelBusinessInfo>({
    resolver: zodResolver(hotelBusinessInfoSchema),
    defaultValues: {
      hotelName: "",
      location: "",
      area: "",
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

  const uploadImage = async (
  file: File,
  path: string
  ): Promise<string> => {

    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const storageRef = ref(storage, `shops/${user.uid}/${path}`);

    console.log(await uploadBytes(storageRef, file));
    productForm.setValue("imageUrl", "")
    return await getDownloadURL(storageRef);
  };

  const handleLogoUpload = async (file: File) => {
  const url = await uploadImage(file, "logo");
  setBranding(prev => ({ ...prev, logoUrl: url }));
    };

    const handleCoverUpload = async (file: File) => {
      const url = await uploadImage(file, "cover");
      setBranding(prev => ({ ...prev, coverUrl: url }));
    };


  const completeOnboardingMutation = useMutation({
  mutationFn: async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const vendorRef = doc(db, "shops", currentUser.uid);
    console.log(vendorRef)
    await setDoc(
      vendorRef,
      {
        role: "hotels",
        location: businessInfo?.location,
        area: businessInfo?.area,
        onboardingComplete: true,
        businessInfo,
        workingHours: workingHours,
        branding,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const productsRef = collection(vendorRef, "products");

        const productWrites = products.map(({ id, ...product }) =>
          addDoc(productsRef, {
            ...product,
            available: true,
            createdAt: serverTimestamp(),
          })
        );

        await Promise.all(productWrites);
      },

      onSuccess: () => {
        toast({
          title: "Onboarding complete!",
          description: "Your store is now live. Welcome to DeliverEase!",
        });

        navigate("/dashboard/vendor");
      },

      onError: (error: any) => {
        console.error("Vendor onboarding error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to complete onboarding.",
          variant: "destructive",
        });
      },
    });



  const handleBusinessInfoSubmit = (data: HotelBusinessInfo) => {
    setBusinessInfo(data);
    setStep(2);
  };

  const handleBrandingSubmit = () => {
    setIsUploadingUrls(true);
    handleLogoUpload(logoInputRef.current?.files?.[0]!).then(() => {
      handleCoverUpload(coverInputRef.current?.files?.[0]!).then(() => {
        setIsUploadingUrls(false);
        setStep(4);
      });
    });
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


  const updateDay = (
  day: Day,
  field: HourField,
  value: string | boolean
    ): void => {
      setWorkingHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
        },
      }));
    };


  const copyToAllDays = (sourceDay: Day): void => {
  const sourceHours = workingHours[sourceDay];

  const newHours: WorkingHours = {} as WorkingHours;

  DAYS.forEach(day => {
    newHours[day] = { ...sourceHours };
  });

  setWorkingHours(newHours);
  setSameHoursAllDays(true);
};


  const copyToWeekdays = (sourceDay: Day): void => {
  const sourceHours = workingHours[sourceDay];

  setWorkingHours(prev => {
    const updated: WorkingHours = { ...prev };

    (
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Day[]
    ).forEach(day => {
      updated[day] = { ...sourceHours };
    });

    return updated;
  });
};

const handleSameHoursToggle = (checked: boolean): void => {
  setSameHoursAllDays(checked);

  if (checked) {
    copyToAllDays('Monday');
  }
};


type PresetType = 'mon-sat' | 'mon-fri' | '24-7';

const applyPreset = (presetType: PresetType): void => {
  let newHours: WorkingHours = {} as WorkingHours;

  if (presetType === 'mon-sat') {
    const preset: DayHours = {
      open: '09:00',
      close: '17:00',
      closed: false,
    };

    DAYS.forEach(day => {
      newHours[day] =
        day === 'Sunday'
          ? { open: '', close: '', closed: true }
          : { ...preset };
    });
  }

  if (presetType === 'mon-fri') {
    const preset: DayHours = {
      open: '08:00',
      close: '18:00',
      closed: false,
    };

    DAYS.forEach(day => {
      newHours[day] =
        day === 'Saturday' || day === 'Sunday'
          ? { open: '', close: '', closed: true }
          : { ...preset };
    });
  }

  if (presetType === '24-7') {
    const preset: DayHours = {
      open: '00:00',
      close: '23:59',
      closed: false,
    };

    DAYS.forEach(day => {
      newHours[day] = { ...preset };
    });
  }

  setWorkingHours(newHours);
};


  const handleWorkingHoursSubmit = () => {
    setStep(3);
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
    { number: 2, title: "Working Hours" },
    { number: 3, title: "Branding" },
    { number: 4, title: "Products" },
  ];

  const daysToShow = sameHoursAllDays ? ['Monday'] : DAYS;

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
                      name="hotelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel Name</FormLabel>
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
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Agona Nkwanta"
                              data-testid="input-location"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Around the police station"
                              data-testid="input-area"
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

           {/* Step 2: Working Hours */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Hours
                </CardTitle>
                <CardDescription>Set your business operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        Same hours every day
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apply the same working hours to all days of the week
                      </p>
                    </div>
                    <Switch
                      id="same-hours"
                      checked={sameHoursAllDays}
                      onCheckedChange={handleSameHoursToggle}
                    />
                  </div>

                  <div className="space-y-4">
                    {daysToShow.map((day) => (
                      <div key={day} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <Label className="text-base font-medium min-w-[100px]">
                              {sameHoursAllDays ? 'All Days' : day}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!workingHours[day].closed}
                                onCheckedChange={(checked) => updateDay(day, 'closed', !checked)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {workingHours[day].closed ? 'Closed' : 'Open'}
                              </span>
                            </div>
                          </div>

                          {!sameHoursAllDays && !workingHours[day].closed && (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => copyToWeekdays(day)}
                                className="gap-2"
                              >
                                <Copy className="h-3 w-3" />
                                <span className="hidden sm:inline">Copy to weekdays</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => copyToAllDays(day)}
                                className="gap-2"
                              >
                                <Copy className="h-3 w-3" />
                                <span className="hidden sm:inline">Copy to all</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {!workingHours[day].closed && (
                          <div className="flex items-center gap-4 flex-wrap sm:ml-[115px]">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`${day}-open`} className="text-sm text-muted-foreground">
                                From
                              </Label>
                              <Input
                                id={`${day}-open`}
                                type="time"
                                value={workingHours[day].open}
                                onChange={(e) => updateDay(day, 'open', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label  className="text-sm text-muted-foreground">
                                To
                              </Label>
                              <Input
                                id={`${day}-close`}
                                type="time"
                                value={workingHours[day].close}
                                onChange={(e) => updateDay(day, 'close', e.target.value)}
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!sameHoursAllDays && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Quick Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset('mon-sat')}
                        >
                          9 AM - 5 PM (Mon-Sat)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset('mon-fri')}
                        >
                          8 AM - 6 PM (Mon-Fri)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset('24-7')}
                        >
                          24/7
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleWorkingHoursSubmit} className="gap-2">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-ash dark:border-border">
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Upload your brand assets</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* LOGO */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = await uploadImage(file, "logo");
                      setBranding(prev => ({ ...prev, logoUrl: url }));
                    }}
                  />

                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {branding.logoUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBranding(prev => ({ ...prev, logoUrl: "" }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload logo
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* COVER IMAGE */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Cover Image</label>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const url = await uploadImage(file, "cover");
                      setBranding(prev => ({ ...prev, coverUrl: url }));
                    }}
                  />

                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {branding.coverUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={branding.coverUrl}
                          alt="Cover"
                          className="w-full h-32 object-cover rounded-lg"
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBranding(prev => ({ ...prev, coverUrl: "" }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload cover image
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  <Button onClick={handleBrandingSubmit}>
                    {isUploadingUrls ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                         Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                    
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}


          {step === 4 && (
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
                          <div>
                            <label className="text-sm font-medium mb-2 block">Product Image</label>

                            <input
                              ref={productImageInputRef}
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const url = await uploadImage(file, `product-${file.name}`)
                                productForm.setValue("imageUrl", url)
                              }}
                            />

                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                              {productForm.watch("imageUrl") ? (
                                <div className="flex flex-col items-center gap-4">
                                  <img
                                    src={productForm.watch("imageUrl")}
                                    alt="Product"
                                    className="w-24 h-24 object-cover rounded-lg"
                                  />

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => productForm.setValue("imageUrl", "")}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-10 w-10 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Click to upload product image
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => productImageInputRef.current?.click()}
                                  >
                                    Choose File
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

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
