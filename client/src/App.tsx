import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SignUp from "@/pages/signup";
import SignIn from "@/pages/signin";
import VendorOnboarding from "@/pages/vendor-onboarding";
import DriverOnboarding from "@/pages/driver-onboarding";
import VendorDashboard from "@/pages/vendor-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import { useEffect, useState } from "react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ 
  children, 
  requireOnboarding = false,
  allowedRole 
}: { 
  children: React.ReactNode;
  requireOnboarding?: boolean;
  allowedRole?: "vendor" | "driver";
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/signin");
        setIsChecking(false);
      } else if (allowedRole && user.role !== allowedRole) {
        navigate(user.role === "vendor" ? "/dashboard/vendor" : "/dashboard/driver");
        setIsChecking(false);
      } else if (requireOnboarding && user.onboardingComplete) {
        navigate(user.role === "vendor" ? "/dashboard/vendor" : "/dashboard/driver");
        setIsChecking(false);
      } else {
        setIsChecking(false);
      }
    }
  }, [user, isLoading, navigate, allowedRole, requireOnboarding]);

  if (isLoading || isChecking) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route path="/onboarding/vendor">
        <ProtectedRoute requireOnboarding allowedRole="vendor">
          <VendorOnboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/driver">
        <ProtectedRoute requireOnboarding allowedRole="driver">
          <DriverOnboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/vendor">
        <ProtectedRoute allowedRole="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/driver">
        <ProtectedRoute allowedRole="driver">
          <DriverDashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
