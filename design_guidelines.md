# Design Guidelines for Multi-Vendor Ecommerce & Delivery Onboarding Platform

## Design System (Mandatory Colors)

**Color Palette:**
- Primary: `#27AE60` (Green - main brand color)
- Secondary: `#6FCF97` (Light green)
- Accent: `#FFA726` (Orange - CTAs and highlights)
- Success: `#2ECC71` (Confirmation states)
- Grey: `#B0B0B0` (Secondary text/borders)
- Faint Text: `#757575` (Tertiary text)
- Ash Border: `#E0E0E0` (Dividers and card borders)

**Visual Style:**
- Clean, modern UI with card-based layouts throughout
- Rounded corners on all cards, buttons, and inputs (8-12px border radius)
- Subtle shadows for depth (use soft drop shadows on cards)
- Fully responsive across mobile, tablet, and desktop breakpoints
- Accessible contrast ratios for all text/background combinations

## Landing Page Structure

**Hero Section:**
- Large, impactful hero with background image/gradient
- Clear headline explaining platform value: vendors sell, drivers deliver
- Two prominent CTA buttons side-by-side:
  - "Become a Vendor" (Primary green)
  - "Become a Driver" (Accent orange)
- Buttons on hero should have blurred backgrounds for readability

**Content Sections:**
1. **Features Section**: 3-4 feature cards in grid layout, icons + title + description
2. **How It Works**: 3-4 step process with numbered visual indicators
3. **Testimonials**: Card-based testimonials with mock user data, avatars, and ratings
4. **Footer**: Multi-column footer with quick links, social icons, contact info

## Authentication Pages

**Sign Up/Sign In Forms:**
- Centered card layout with generous padding
- Role selection (Vendor/Driver) using radio buttons or toggle during signup
- Form inputs with clear labels, validation states (error borders in red, success in green)
- Loading states on buttons (spinner + disabled state)
- Error messages in red text below inputs
- "Remember me" checkbox for sign-in
- Clean typography hierarchy

## Vendor Onboarding Wizard

**Multi-step Progress Indicator:**
- Visual stepper at top showing Steps 1/2/3
- Active step in Primary green, completed steps with checkmark

**Step 1 - Business Information:**
- Form card with: Brand name input, Category dropdown (Fast Food, Grocery, Bakery, Pharmacy), Business description textarea

**Step 2 - Branding:**
- Image upload zones for logo and cover image
- Visual preview of uploaded images
- Drag-and-drop or click-to-upload interface

**Step 3 - Products Setup:**
- Product card grid showing added products
- "Add Product" button (Primary green)
- Product form modal/card: Name, Price, Category dropdown, Image upload, In-stock toggle switch, Description, Optional addons section (+ button to add addon rows with name/price fields)
- Display sample products (Fresh Bread, Custom Cake with addons) as initial examples

## Driver Onboarding Wizard

**Multi-step Progress Indicator:**
- Visual stepper showing Steps 1/2

**Step 1 - Personal Info:**
- Full name and phone number inputs in card layout

**Step 2 - Vehicle Info:**
- Vehicle type selection (Bike, Keke, Car, Van) using card-based radio buttons with vehicle icons
- Vehicle number input
- Vehicle color picker: visual color swatches that dynamically update vehicle image preview
- Live preview showing selected vehicle type in chosen color

## Dashboard Layouts

**Vendor Dashboard:**
- Summary cards row: Total products, Active orders, Revenue (with icons and numbers)
- Product management table/grid with edit/delete actions
- Orders list with status badges (Pending/Completed - use Success green)
- Earnings chart/visualization

**Driver Dashboard:**
- Availability toggle (large, prominent switch - green when active)
- Assigned deliveries cards with vendor info, delivery address, status
- Vehicle info card displaying selected vehicle image with color
- Earnings summary with daily/weekly breakdown

## Component Specifications

**Buttons:**
- Primary: Filled with Primary green, white text
- Secondary: Outlined with Grey border
- Accent: Filled with Accent orange for secondary CTAs
- Rounded corners (6-8px), medium padding
- Hover states: slight darkening, no blur effects

**Cards:**
- White background, Ash Border (#E0E0E0)
- Border radius: 12px
- Subtle shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Padding: 24px

**Forms:**
- Input height: 44px minimum for accessibility
- Border: 1px solid Ash Border, focus state with Primary green border
- Error state: red border with error text below
- Labels above inputs in Faint Text color

**Typography:**
- Headings: Bold, clear hierarchy (H1: 36px, H2: 28px, H3: 20px)
- Body: 16px, Faint Text color for secondary content
- Use sans-serif font family (Inter, Roboto, or similar)

## Images

**Landing Page:**
- Hero: Full-width background image showing happy vendors/drivers using platform or delivery in action

**Onboarding:**
- Vehicle images for driver flow: High-quality images of Bike, Keke, Car, Van in multiple colors
- Product images: Sample images for Fresh Bread, Custom Cake
- Vendor branding: Sample brand cover and logo images

**Dashboards:**
- Icons for summary metrics (products, orders, revenue)
- Vehicle preview images matching selected color

## Spacing & Layout

- Consistent vertical rhythm: 16px, 24px, 32px, 48px spacing units
- Container max-width: 1280px for main content
- Grid gaps: 24px between cards
- Section padding: 64px vertical, 24px horizontal (mobile: 32px vertical, 16px horizontal)