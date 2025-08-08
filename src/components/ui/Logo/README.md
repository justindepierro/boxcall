# 🎨 BoxCall Logo System

Professional logo component system with intelligent sizing, color modes, and usage guidelines.

## 📋 **Logo Assets Inventory**

### ✅ **Current Assets**

- **`boxcall-logo.svg`** - Icon only (green #059669)
- **`boxcall-logo-with-text.svg`** - Logo + text (green #059669)

### 📝 **Missing Assets (Recommended)**

- **White versions** for dark backgrounds
- **Black versions** for print/high contrast
- **PNG/WebP formats** for broader compatibility

## 🚀 **Usage Examples**

### **Basic Usage**

```tsx
import { Logo } from "@/components/ui/Logo";

// Default: icon variant, medium size, brand color
<Logo />

// Full logo with text, large size
<Logo variant="full" size="lg" />

// Small white icon for dark backgrounds
<Logo variant="icon" size="sm" color="white" />
```

### **Context-Specific Components**

```tsx
import {
  NavbarLogo,
  AuthLogo,
  SidebarLogo,
  HeroLogo
} from "@/components/ui/Logo";

<NavbarLogo />  // Perfect for navigation bars
<AuthLogo />    // Optimized for login/register forms
<SidebarLogo /> // Small size for sidebars
<HeroLogo />    // Large for hero sections
```

## 🎯 **Size Guidelines**

| Size  | Height | Best For               |
| ----- | ------ | ---------------------- |
| `xs`  | 16px   | Inline text, favicons  |
| `sm`  | 24px   | Sidebar, small buttons |
| `md`  | 32px   | Navbar, cards          |
| `lg`  | 48px   | Auth forms, headers    |
| `xl`  | 64px   | Hero sections          |
| `2xl` | 80px   | Splash screens         |

## 🎨 **Color Modes**

| Color     | Usage                   | Background             |
| --------- | ----------------------- | ---------------------- |
| `brand`   | Primary green (#059669) | Light backgrounds      |
| `white`   | White logo              | Dark/brand backgrounds |
| `black`   | Black logo              | Print, high contrast   |
| `current` | Inherit from parent     | Dynamic contexts       |

## 📐 **Professional Usage Guidelines**

### **✅ Do**

- Use `icon` variant when space is limited
- Use `full` variant for brand recognition
- Maintain minimum clear space around logos
- Use `brand` color on light backgrounds
- Use `white` color on dark backgrounds

### **❌ Don't**

- Scale below minimum sizes (16px icon, 100px full)
- Use green logo on colored backgrounds
- Stretch or distort logo proportions
- Place logo over busy background images

## 🔧 **Integration with Icon System**

The Logo component works alongside the existing Icon system:

```tsx
// Icons for UI elements
<Icon name="menu" size="md" />

// Brand logo for identity
<Logo variant="icon" size="md" />
```

## 🚀 **Next Steps**

1. **Create missing asset variants** (white, black versions)
2. **Add PNG/WebP formats** for better compatibility
3. **Update existing components** to use new Logo system
4. **Add logo to Icon system** as `boxcall` icon name

## 📊 **Current Implementation Status**

- ✅ Logo component system created
- ✅ Size and color configuration
- ✅ Context-specific components
- ✅ Professional guidelines documented
- ⚠️ Missing white/black variants
- ⚠️ Components not yet updated to use new system
