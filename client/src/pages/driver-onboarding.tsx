import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  driverPersonalInfoSchema, 
  driverVehicleInfoSchema,
  type DriverPersonalInfo, 
  type DriverVehicleInfo 
} from "@shared/schema";
import { 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Bike,
  Car
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const vehicleTypes = [
  { value: "bike", label: "Bike", icon: Bike },
  { value: "keke", label: "Keke", icon: Car },
  { value: "car", label: "Car", icon: Car },
  { value: "van", label: "Van", icon: Car },
] as const;

const vehicleColors = [
  { name: "Black", value: "#1a1a1a", textColor: "white" },
  { name: "White", value: "#ffffff", textColor: "black" },
  { name: "Silver", value: "#c0c0c0", textColor: "black" },
  { name: "Red", value: "#dc2626", textColor: "white" },
  { name: "Blue", value: "#2563eb", textColor: "white" },
  { name: "Green", value: "#16a34a", textColor: "white" },
  { name: "Yellow", value: "#eab308", textColor: "black" },
  { name: "Orange", value: "#ea580c", textColor: "white" },
];

export default function DriverOnboarding() {
  const [, navigate] = useLocation();
  const { user, setDriver, updateUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<DriverPersonalInfo | null>(null);

  const personalForm = useForm<DriverPersonalInfo>({
    resolver: zodResolver(driverPersonalInfoSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
    },
  });

  const vehicleForm = useForm<DriverVehicleInfo>({
    resolver: zodResolver(driverVehicleInfoSchema),
    defaultValues: {
      vehicleType: "bike",
      vehicleNumber: "",
      vehicleColor: "",
    },
  });

  const selectedVehicleType = vehicleForm.watch("vehicleType");
  const selectedColor = vehicleForm.watch("vehicleColor");

  const completeOnboardingMutation = useMutation({
    mutationFn: async (vehicleInfo: DriverVehicleInfo) => {
      const response = await apiRequest("POST", "/api/drivers", {
        userId: user?.id,
        ...personalInfo,
        ...vehicleInfo,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDriver(data.driver);
      updateUser({ onboardingComplete: true });
      toast({
        title: "Onboarding complete!",
        description: "You're now ready to start delivering. Welcome to DeliverEase!",
      });
      navigate("/dashboard/driver");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding.",
        variant: "destructive",
      });
    },
  });

  const handlePersonalInfoSubmit = (data: DriverPersonalInfo) => {
    setPersonalInfo(data);
    setStep(2);
  };

  const handleVehicleInfoSubmit = (data: DriverVehicleInfo) => {
    completeOnboardingMutation.mutate(data);
  };

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Vehicle Info" },
  ];

  const getVehiclePreviewColor = () => {
    const color = vehicleColors.find(c => c.name === selectedColor);
    return color?.value || "#9ca3af";
  };

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
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center">
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
                    <span className={`text-sm font-medium ${
                      step >= s.number ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${
                      step > s.number ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card className="border-ash dark:border-border" data-testid="card-personal-info">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-6">
                    <FormField
                      control={personalForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Augustine Okonkwo"
                              data-testid="input-full-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="e.g., 0593528296"
                              data-testid="input-phone-number"
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
            <Card className="border-ash dark:border-border" data-testid="card-vehicle-info">
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Tell us about your vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...vehicleForm}>
                  <form onSubmit={vehicleForm.handleSubmit(handleVehicleInfoSubmit)} className="space-y-6">
                    <FormField
                      control={vehicleForm.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                            >
                              {vehicleTypes.map((vehicle) => (
                                <div key={vehicle.value}>
                                  <RadioGroupItem
                                    value={vehicle.value}
                                    id={vehicle.value}
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor={vehicle.value}
                                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-ash dark:border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-colors"
                                    data-testid={`radio-${vehicle.value}`}
                                  >
                                    <vehicle.icon className="h-8 w-8 text-primary" />
                                    <span className="font-medium text-sm">{vehicle.label}</span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="vehicleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., GE 4231-24"
                              data-testid="input-vehicle-number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={vehicleForm.control}
                      name="vehicleColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Color</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                              {vehicleColors.map((color) => (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => field.onChange(color.name)}
                                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                                    field.value === color.name
                                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                                      : "border-ash dark:border-border"
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                  data-testid={`color-${color.name.toLowerCase()}`}
                                >
                                  {field.value === color.name && (
                                    <Check 
                                      className="h-5 w-5 mx-auto" 
                                      style={{ color: color.textColor }}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedVehicleType && selectedColor && (
                      <div className="rounded-lg border border-ash dark:border-border p-6 bg-muted/30">
                        <h4 className="text-sm font-medium mb-4 text-center">Vehicle Preview</h4>
                        <div className="flex justify-center">
                          <div 
                            className="w-32 h-24 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: getVehiclePreviewColor() }}
                            data-testid="vehicle-preview"
                          >
                            {selectedVehicleType === "bike" ? (
                              <Bike className="h-12 w-12" style={{ color: vehicleColors.find(c => c.name === selectedColor)?.textColor || "white" }} />
                            ) : (
                              <Car className="h-12 w-12" style={{ color: vehicleColors.find(c => c.name === selectedColor)?.textColor || "white" }} />
                            )}
                          </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-3">
                          {selectedColor} {vehicleTypes.find(v => v.value === selectedVehicleType)?.label}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)} className="gap-2" data-testid="button-back-step-2">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={completeOnboardingMutation.isPending}
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
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
