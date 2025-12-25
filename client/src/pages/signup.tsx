import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { signUpSchema, type SignUpForm } from "@shared/schema";
import { ShoppingBag, Store, Truck, Loader2, Hotel, Wrench } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/firebase_auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUp() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const defaultRole = params.get("role") as "vendor" | "driver" | "hotel_manager" | "skilled_professional" | null;
  const { loginWithProfile } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: defaultRole || "vendor",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpForm) => {
      console.log("Signing up user with data password:", data.password);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      
      // Determine collection based on role
      let collection = "users";
      if (data.role === "vendor") collection = "shops";
      else if (data.role === "driver") collection = "drivers";
      else if (data.role === "hotel_manager") collection = "hotels";
      else if (data.role === "skilled_professional") collection = "professionals";

      await setDoc(doc(db, collection, user.uid), {
        email: data.email,
        phone: data.phone,
        role: data.role,
        rating: 0,
        reviewCount: 0,
        onboardingComplete: false, 
        createdAt: new Date(),
      });

      setUserRole(data.role);

      return {
        uid: user.uid,
        email: data.email,
        role: data.role,
      };
    },

    onSuccess: async (userData) => {
      console.log("User signed up successfully:", password);
      await loginWithProfile(
        userData.email, 
        password, 
        userRole as "vendor" | "driver" | "hotel_manager" | "skilled_professional"
      );

      toast({
        title: "Account created!",
        description: "Let's complete your profile.",
      });

      console.log("Signed up user data:", userData);
      
      // Navigate based on role
      if (userData.role === "vendor") {
        navigate("/onboarding/vendor");
      } else if (userData.role === "driver") {
        navigate("/onboarding/driver");
      } else if (userData.role === "hotel_manager") {
        navigate("/onboarding/hotel");
      } else if (userData.role === "skilled_professional") {
        navigate("/onboarding/professional");
      }
    },

    onError: (error: any) => {
      toast({
        title: "Sign up failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignUpForm) => {
    setPassword(data.password);
    signUpMutation.mutate(data);
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl border-ash dark:border-border" data-testid="card-signup">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-signup-title">Create your account</CardTitle>
            <CardDescription>Join DeliverEase and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I want to join as</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-3"
                        >
                          {/* Vendor Option */}
                          <div>
                            <RadioGroupItem
                              value="vendor"
                              id="vendor"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="vendor"
                              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-ash dark:border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                              data-testid="radio-vendor"
                            >
                              <Store className="h-6 w-6 text-primary" />
                              <span className="font-semibold">Vendor</span>
                              <span className="text-xs text-muted-foreground text-center leading-tight">Sell products online</span>
                            </Label>
                          </div>

                          {/* Driver Option */}
                          <div>
                            <RadioGroupItem
                              value="driver"
                              id="driver"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="driver"
                              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-ash dark:border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 cursor-pointer transition-all h-full"
                              data-testid="radio-driver"
                            >
                              <Truck className="h-6 w-6 text-accent" />
                              <span className="font-semibold">Driver</span>
                              <span className="text-xs text-muted-foreground text-center leading-tight">Deliver orders</span>
                            </Label>
                          </div>

                          {/* Hotel Manager Option */}
                          <div>
                            <RadioGroupItem
                              value="hotel_manager"
                              id="hotel_manager"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="hotel_manager"
                              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-ash dark:border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/5 cursor-pointer transition-all h-full"
                              data-testid="radio-hotel-manager"
                            >
                              <Hotel className="h-6 w-6 text-blue-500" />
                              <span className="font-semibold">Hotel Manager</span>
                              <span className="text-xs text-muted-foreground text-center leading-tight">Manage hotel services</span>
                            </Label>
                          </div>

                          {/* Skilled Professional Option */}
                          <div>
                            <RadioGroupItem
                              value="skilled_professional"
                              id="skilled_professional"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="skilled_professional"
                              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-ash dark:border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/5 cursor-pointer transition-all h-full"
                              data-testid="radio-skilled-professional"
                            >
                              <Wrench className="h-6 w-6 text-orange-500" />
                              <span className="font-semibold">Professional</span>
                              <span className="text-xs text-muted-foreground text-center leading-tight">Offer skilled services</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="024 123 4567"
                          data-testid="input-phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signUpMutation.isPending}
                  data-testid="button-submit-signup"
                >
                  {signUpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/signin" className="text-primary hover:underline" data-testid="link-signin">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}