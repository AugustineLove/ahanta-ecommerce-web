import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Truck,
  LogOut,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  Bike,
  Car
} from "lucide-react";
import { useAuth } from "@/lib/firebase_auth";

interface Delivery {
  id: string;
  vendorName: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: string;
  amount: number;
  status: "assigned" | "picked_up" | "delivering" | "completed";
  distance: string;
  estimatedTime: string;
}

const mockDeliveries: Delivery[] = [
  {
    id: "DEL-001",
    vendorName: "SHALOM FAST FOOD",
    customerName: "Chioma Adebayo",
    pickupAddress: "123 Market Street, Lagos",
    deliveryAddress: "45 Victoria Island, Lagos",
    items: "2x Fresh Bread, 1x Custom Cake",
    amount: 15.00,
    status: "assigned",
    distance: "3.2 km",
    estimatedTime: "15 mins"
  },
  {
    id: "DEL-002",
    vendorName: "Daily Groceries",
    customerName: "Emmanuel Obi",
    pickupAddress: "78 Allen Avenue, Ikeja",
    deliveryAddress: "12 Opebi Road, Ikeja",
    items: "Weekly grocery package",
    amount: 12.50,
    status: "picked_up",
    distance: "2.1 km",
    estimatedTime: "10 mins"
  },
  {
    id: "DEL-003",
    vendorName: "Mama's Kitchen",
    customerName: "Grace Nwosu",
    pickupAddress: "56 Lekki Phase 1",
    deliveryAddress: "89 Ajah Road, Lagos",
    items: "Family meal set",
    amount: 18.00,
    status: "completed",
    distance: "5.8 km",
    estimatedTime: "25 mins"
  },
];

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

export default function HotelDashboard() {
  const [, navigate] = useLocation();
  const { user, driver, logout } = useAuth();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(driver?.isAvailable ?? true);
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const stats = [
    { 
      title: "Active Deliveries", 
      value: deliveries.filter(d => d.status !== "completed").length, 
      icon: Package, 
      color: "text-primary",
      bgColor: "bg-primary/10" 
    },
    { 
      title: "Completed Today", 
      value: deliveries.filter(d => d.status === "completed").length, 
      icon: CheckCircle, 
      color: "text-success",
      bgColor: "bg-success/10" 
    },
    { 
      title: "Today's Earnings", 
      value: `$${deliveries.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0).toFixed(2)}`, 
      icon: DollarSign, 
      color: "text-accent",
      bgColor: "bg-accent/10" 
    },
    { 
      title: "Total Distance", 
      value: "11.1 km", 
      icon: Navigation, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10" 
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

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    toast({
      title: isAvailable ? "You're now offline" : "You're now online",
      description: isAvailable 
        ? "You won't receive new delivery assignments." 
        : "You can now receive delivery assignments.",
    });
  };

  const updateDeliveryStatus = (deliveryId: string) => {
    setDeliveries(deliveries.map(d => {
      if (d.id === deliveryId) {
        const statusOrder: Delivery["status"][] = ["assigned", "picked_up", "delivering", "completed"];
        const currentIndex = statusOrder.indexOf(d.status);
        const nextStatus = statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)];
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const getStatusColor = (status: Delivery["status"]) => {
    switch (status) {
      case "assigned": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "picked_up": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "delivering": return "bg-primary/10 text-primary";
      case "completed": return "bg-success/10 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Delivery["status"]) => {
    switch (status) {
      case "assigned": return "Assigned";
      case "picked_up": return "Picked Up";
      case "delivering": return "Delivering";
      case "completed": return "Completed";
      default: return status;
    }
  };

  const getNextAction = (status: Delivery["status"]) => {
    switch (status) {
      case "assigned": return "Mark as Picked Up";
      case "picked_up": return "Start Delivery";
      case "delivering": return "Complete Delivery";
      default: return null;
    }
  };

  const getVehicleColor = () => {
    const color = vehicleColors.find(c => c.name === driver?.vehicleInfo.vehicleColor);
    return color || { value: "#9ca3af", textColor: "white", name: "Grey" };
  };

  const VehicleIcon = driver?.vehicleInfo.vehicleType === "bike" ? Bike : Car;

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
              <p className="text-sm font-medium" data-testid="text-driver-name">{driver?.personalInfo.fullName || "Driver"}</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage your deliveries and earnings</p>
          </div>
          <Card className={`border-2 ${isAvailable ? "border-success" : "border-ash dark:border-border"}`} data-testid="card-availability">
            <CardContent className="flex items-center gap-4 p-4">
              <div>
                <p className="font-medium">Availability</p>
                <p className={`text-sm ${isAvailable ? "text-success" : "text-muted-foreground"}`}>
                  {isAvailable ? "Online - Accepting deliveries" : "Offline"}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
                className="data-[state=checked]:bg-success"
                data-testid="switch-availability"
              />
            </CardContent>
          </Card>
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

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-ash dark:border-border" data-testid="card-deliveries">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Assigned Deliveries
                </CardTitle>
                <CardDescription>Your current delivery assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveries.filter(d => d.status !== "completed").length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No active deliveries</p>
                      <p className="text-sm text-muted-foreground">New assignments will appear here</p>
                    </div>
                  ) : (
                    deliveries.filter(d => d.status !== "completed").map((delivery) => (
                      <Card key={delivery.id} className="border-ash dark:border-border" data-testid={`delivery-card-${delivery.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{delivery.id}</p>
                                <Badge variant="secondary" className={getStatusColor(delivery.status)}>
                                  {getStatusLabel(delivery.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-primary font-medium mt-1">{delivery.vendorName}</p>
                            </div>
                            <p className="font-semibold text-accent">${delivery.amount.toFixed(2)}</p>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pickup</p>
                                <p className="text-sm">{delivery.pickupAddress}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Deliver to: {delivery.customerName}</p>
                                <p className="text-sm">{delivery.deliveryAddress}</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">{delivery.items}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {delivery.distance}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {delivery.estimatedTime}
                              </span>
                            </div>
                            {getNextAction(delivery.status) && (
                              <Button
                                size="sm"
                                onClick={() => updateDeliveryStatus(delivery.id)}
                                data-testid={`button-update-${delivery.id}`}
                              >
                                {getNextAction(delivery.status)}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {deliveries.filter(d => d.status === "completed").length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Completed Today</h4>
                    <div className="space-y-2">
                      {deliveries.filter(d => d.status === "completed").map((delivery) => (
                        <div 
                          key={delivery.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                          data-testid={`completed-delivery-${delivery.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-success" />
                            <div>
                              <p className="text-sm font-medium">{delivery.vendorName}</p>
                              <p className="text-xs text-muted-foreground">{delivery.customerName}</p>
                            </div>
                          </div>
                          <p className="font-medium text-success">+${delivery.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-ash dark:border-border" data-testid="card-vehicle">
              <CardHeader>
                <CardTitle>Vehicle Info</CardTitle>
                <CardDescription>Your registered vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-20 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: getVehicleColor().value }}
                    data-testid="vehicle-preview"
                  >
                    <VehicleIcon 
                      className="h-10 w-10" 
                      style={{ color: getVehicleColor().textColor }} 
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium capitalize">{driver?.vehicleInfo.vehicleType || "Keke"}</p>
                    <p className="text-sm text-muted-foreground">{getVehicleColor().name}</p>
                    <p className="text-lg font-bold mt-2">{driver?.vehicleInfo.vehicleNumber || "GE 4231-24"}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ash dark:border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{driver?.personalInfo.phoneNumber || "0593528296"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-ash dark:border-border" data-testid="card-earnings-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Today</p>
                      <p className="text-xl font-bold text-primary">$45.50</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success">+$12.50</p>
                      <p className="text-xs text-muted-foreground">from yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-xl font-bold text-primary">$287.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success">+8%</p>
                      <p className="text-xs text-muted-foreground">from last week</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-xl font-bold text-primary">$1,124.50</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success">+15%</p>
                      <p className="text-xs text-muted-foreground">from last month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
