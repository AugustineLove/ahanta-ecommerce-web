import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { signInSchema, type SignInForm } from "@shared/schema";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/firebase_auth";

export default function SignIn() {
  const [, navigate] = useLocation();
  const { loginWithProfile, logout, signUp } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"vendor" | "driver" | "hotel_manager" | "skilled_professional" | null>(null);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
       role: "driver",
    },
  });

 const signInMutation = useMutation({
  mutationFn: async ({ email, password, role }: SignInForm) => {
    const user = await loginWithProfile(email, password, role);
    setUserRole(role);
    console.log("Sign-in mutation user:", role, user);
    return user;
  },

  onSuccess: async (user) => {
    toast({
      title: "Welcome back!",
      description: "You've signed in successfully.",
    });
    const collection = user.role === "vendor" ? "shops" : user.role === "driver" ? 'drivers' : user.role === 'hotel_manager' ? 'hotels' : 'professionals';
    const userDocRef = doc(db, collection, user.id);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }

    const userData = userSnap.data() as {
      role: "vendor" | "driver" | "hotel_manager" | "skilled_professional";
      onboardingComplete: boolean;
    };
    console.log("Signed in user data:", userData.onboardingComplete, userData.role);

    if (!userData.onboardingComplete) {
      console.log("Navigating to onboarding for role:", userData.role);
      navigate(
        userData.role === "vendor"
          ? "/onboarding/vendor"
          : "/onboarding/driver"
      );
    } else {
      console.log("Navigating to dashboard for role:", userData.role);
      navigate(
        userData.role === "vendor"
          ? "/dashboard/vendor"
          : "/dashboard/driver"
      );
    }
  },

  onError: (error: any) => {
    toast({
      title: "Sign in failed",
      description:
        error?.message['message'] || 'Invalid email or password',
      variant: "destructive",
    });
  },
});


  const onSubmit = (data: SignInForm) => {
     const safeData = { ...data };
     setPassword(safeData.password);
    signInMutation.mutate(safeData);
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
        <Card className="w-full max-w-md border-ash dark:border-border" data-testid="card-signin">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-signin-title">Welcome back</CardTitle>
            <CardDescription>Sign in to your DeliverEase account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="hotel_manager">Hotel</SelectItem>
                        <SelectItem value="skilled_professional">Skilled Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" data-testid="checkbox-remember" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signInMutation.isPending}
                  data-testid="button-submit-signin"
                >
                  {signInMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline" data-testid="link-signup">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
