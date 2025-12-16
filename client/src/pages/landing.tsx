import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Store, 
  Truck, 
  ShoppingBag, 
  Clock, 
  Shield, 
  TrendingUp,
  ChevronRight,
  Star,
  Users,
  Package,
  MapPin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const features = [
  {
    icon: Store,
    title: "Easy Store Setup",
    description: "Set up your online store in minutes with our intuitive onboarding process. No technical skills required."
  },
  {
    icon: Truck,
    title: "Fast Delivery Network",
    description: "Connect with verified drivers ready to deliver your products quickly and safely to customers."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Receive payments securely with our integrated payment system. Track earnings in real-time."
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Access analytics and insights to understand your customers and grow your revenue."
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up",
    description: "Create your account as a vendor or driver in just a few clicks.",
    icon: Users
  },
  {
    step: 2,
    title: "Complete Onboarding",
    description: "Fill in your business details or vehicle information to get verified.",
    icon: Package
  },
  {
    step: 3,
    title: "Start Earning",
    description: "Vendors list products, drivers accept deliveries. Start earning immediately!",
    icon: TrendingUp
  },
  {
    step: 4,
    title: "Grow Together",
    description: "Build your reputation with reviews and expand your reach on our platform.",
    icon: Star
  }
];

const testimonials = [
  {
    name: "Adaeze Okonkwo",
    role: "Restaurant Owner",
    avatar: "AO",
    rating: 5,
    content: "Since joining this platform, my restaurant orders have doubled! The delivery network is reliable and my customers are happier than ever."
  },
  {
    name: "Chukwuma Eze",
    role: "Delivery Driver",
    avatar: "CE",
    rating: 5,
    content: "Flexible hours and great earnings. I can work when I want and the app makes it easy to manage my deliveries efficiently."
  },
  {
    name: "Ngozi Fashions",
    role: "Fashion Boutique",
    avatar: "NF",
    rating: 5,
    content: "The onboarding was seamless. I had my store up and running in less than an hour. The customer support is excellent!"
  }
];

const stats = [
  { value: "10,000+", label: "Active Vendors" },
  { value: "25,000+", label: "Deliveries Monthly" },
  { value: "5,000+", label: "Verified Drivers" },
  { value: "4.8", label: "Average Rating" }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold" data-testid="text-logo">DeliverEase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-testimonials">Testimonials</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost" data-testid="button-signin">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-get-started">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" data-testid="text-hero-title">
                Connect, Sell, and Deliver with{" "}
                <span className="text-primary">Ease</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl" data-testid="text-hero-description">
                The all-in-one platform where vendors sell their products and drivers deliver them. 
                Join thousands of businesses and drivers growing together.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup?role=vendor">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-become-vendor">
                    <Store className="h-5 w-5" />
                    Become a Vendor
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup?role=driver">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-accent text-accent-foreground border-accent" data-testid="button-become-driver">
                    <Truck className="h-5 w-5" />
                    Become a Driver
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-features-title">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our platform provides all the tools vendors and drivers need to thrive in the delivery economy.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-ash dark:border-border" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-muted/30 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-how-it-works-title">
                How It Works
              </h2>
              <p className="mt-4 text-muted-foreground">
                Getting started is simple. Follow these steps to begin your journey with us.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative" data-testid={`step-${item.step}`}>
                  {index < howItWorks.length - 1 && (
                    <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-border lg:block" />
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {item.step}
                    </div>
                    <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-ash dark:border-border">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-testimonials-title">
                Loved by Vendors and Drivers
              </h2>
              <p className="mt-4 text-muted-foreground">
                See what our community has to say about their experience with DeliverEase.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-ash dark:border-border" data-testid={`card-testimonial-${testimonial.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">"{testimonial.content}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl" data-testid="text-cta-title">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join our growing community of vendors and drivers. Start earning today!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup?role=vendor">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90" data-testid="button-cta-vendor">
                    <Store className="mr-2 h-5 w-5" />
                    Start as Vendor
                  </Button>
                </Link>
                <Link href="/signup?role=driver">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10" data-testid="button-cta-driver">
                    <Truck className="mr-2 h-5 w-5" />
                    Start as Driver
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">DeliverEase</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Connecting vendors with drivers to create seamless delivery experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">For Vendors</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-vendor-signup">Sign Up</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-vendor-pricing">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-vendor-resources">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">For Drivers</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-driver-signup">Sign Up</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-driver-requirements">Requirements</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-driver-support">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-about">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-contact">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DeliverEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
