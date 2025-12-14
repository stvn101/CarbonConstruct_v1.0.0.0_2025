# Tailwind Configuration - Visual Examples

This document provides visual code examples demonstrating how the Tailwind configuration is used throughout the Carbon Construct application.

## 🎨 Color System in Action

### Scope Emission Cards

```tsx
// Scope 1 - Direct Emissions (Coral Red)
<Card className="border-l-4 border-scope-1 shadow-carbon">
  <CardHeader>
    <CardTitle className="text-scope-1 flex items-center gap-2">
      <Factory className="h-5 w-5" />
      Scope 1: Direct Emissions
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-scope-1">1,234 tCO₂e</p>
  </CardContent>
</Card>

// Scope 2 - Energy Emissions (Golden Amber)
<Card className="border-l-4 border-scope-2 shadow-carbon">
  <CardHeader>
    <CardTitle className="text-scope-2 flex items-center gap-2">
      <Zap className="h-5 w-5" />
      Scope 2: Energy Emissions
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-scope-2">567 tCO₂e</p>
  </CardContent>
</Card>

// Scope 3 - Value Chain (Forest Green)
<Card className="border-l-4 border-scope-3 shadow-carbon">
  <CardHeader>
    <CardTitle className="text-scope-3 flex items-center gap-2">
      <TrendingUp className="h-5 w-5" />
      Scope 3: Value Chain
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold text-scope-3">890 tCO₂e</p>
  </CardContent>
</Card>
```

### Life Cycle Assessment Badges

```tsx
// Material Phase
<Badge className="bg-lca-material text-white border-0">
  <Package className="h-3 w-3 mr-1" />
  Material Phase
</Badge>

// Transport Phase
<Badge className="bg-lca-transport text-white border-0">
  <Truck className="h-3 w-3 mr-1" />
  Transport Phase
</Badge>

// Construction Phase
<Badge className="bg-lca-construction text-white border-0">
  <Building className="h-3 w-3 mr-1" />
  Construction Phase
</Badge>

// End of Life Phase
<Badge className="bg-lca-eol text-white border-0">
  <Recycle className="h-3 w-3 mr-1" />
  End of Life
</Badge>
```

### Compliance Framework Indicators

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {/* NCC Compliance */}
  <Card className="border-compliance-ncc bg-compliance-ncc/10">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">NCC</span>
        <CheckCircle className="h-5 w-5 text-compliance-ncc" />
      </div>
    </CardContent>
  </Card>

  {/* GBCA Certification */}
  <Card className="border-compliance-gbca bg-compliance-gbca/10">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">GBCA</span>
        <Award className="h-5 w-5 text-compliance-gbca" />
      </div>
    </CardContent>
  </Card>

  {/* NABERS Rating */}
  <Card className="border-compliance-nabers bg-compliance-nabers/10">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">NABERS</span>
        <Star className="h-5 w-5 text-compliance-nabers" />
      </div>
    </CardContent>
  </Card>
</div>
```

## 🎭 Gradients & Visual Effects

### Hero Section with Gradient

```tsx
<section className="gradient-primary text-white py-20 px-6">
  <div className="container mx-auto text-center">
    <h1 className="text-5xl font-bold mb-6 animate-fade-in">
      Carbon Emissions Calculator
    </h1>
    <p className="text-xl mb-8 animate-slide-up">
      Professional tools for Australian construction projects
    </p>
    <Button 
      size="lg" 
      className="bg-white text-primary hover:bg-white/90 shadow-glow animate-scale-in"
    >
      Get Started
    </Button>
  </div>
</section>
```

### Data Visualization Card

```tsx
<Card className="shadow-elevated hover:shadow-glow transition-all duration-300">
  <CardHeader className="gradient-carbon text-white">
    <CardTitle className="flex items-center gap-2">
      <BarChart3 className="h-5 w-5" />
      Emissions Breakdown
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="space-y-4">
      {/* Chart content */}
    </div>
  </CardContent>
</Card>
```

### Status Indicators with Gradients

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Success State */}
  <div className="gradient-eco text-white p-4 rounded-lg animate-fade-in">
    <CheckCircle className="h-6 w-6 mb-2" />
    <p className="text-sm font-medium">Compliant</p>
  </div>

  {/* Warning State */}
  <div className="gradient-sunset text-white p-4 rounded-lg animate-fade-in">
    <AlertCircle className="h-6 w-6 mb-2" />
    <p className="text-sm font-medium">Review Needed</p>
  </div>

  {/* Info State */}
  <div className="gradient-ocean text-white p-4 rounded-lg animate-fade-in">
    <Info className="h-6 w-6 mb-2" />
    <p className="text-sm font-medium">In Progress</p>
  </div>
</div>
```

## 🎬 Animations & Interactions

### Loading States

```tsx
// Shimmer Effect for Loading
<div className="animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted h-4 rounded w-full" />

// Pulse Glow for Active Elements
<Button className="animate-pulse-glow bg-primary text-white">
  Processing...
</Button>

// Zoom Forward for Hero Elements
<div className="animate-zoom-forward">
  <img src="logo.svg" alt="Logo" className="h-20 w-20" />
</div>
```

### Interactive Dashboard Cards

```tsx
<Card className="group hover:shadow-glow transition-all duration-300 animate-fade-in">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Total Emissions</span>
      <TrendingUp className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold text-primary animate-scale-in">
      2,691 tCO₂e
    </p>
    <p className="text-sm text-muted-foreground mt-2">
      <span className="text-success">↓ 12%</span> from last month
    </p>
  </CardContent>
</Card>
```

### Form Elements with Transitions

```tsx
<div className="space-y-4">
  <div className="animate-slide-up">
    <Label htmlFor="project-name">Project Name</Label>
    <Input 
      id="project-name"
      className="focus:ring-primary focus:border-primary transition-all"
      placeholder="Enter project name"
    />
  </div>
  
  <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
    <Label htmlFor="location">Location</Label>
    <Select>
      <SelectTrigger className="focus:ring-primary transition-all">
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
    </Select>
  </div>

  <Button 
    className="w-full animate-scale-in bg-primary hover:bg-primary-hover transition-colors"
    style={{ animationDelay: "0.2s" }}
  >
    Create Project
  </Button>
</div>
```

## 📊 Chart Styling Examples

### Recharts with Custom Colors

```tsx
// Note: recharts is included in package.json dependencies (v3.5.1)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<BarChart width={600} height={400} data={emissionsData}>
  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
  <XAxis dataKey="name" className="text-muted-foreground" />
  <YAxis className="text-muted-foreground" />
  <Tooltip 
    contentStyle={{ 
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)'
    }}
  />
  <Legend />
  
  {/* Using chart color variables */}
  <Bar dataKey="scope1" fill="hsl(var(--chart-1))" name="Scope 1" />
  <Bar dataKey="scope2" fill="hsl(var(--chart-2))" name="Scope 2" />
  <Bar dataKey="scope3" fill="hsl(var(--chart-3))" name="Scope 3" />
</BarChart>
```

### Pie Chart with LCA Colors

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = [
  'hsl(var(--lca-material))',
  'hsl(var(--lca-transport))',
  'hsl(var(--lca-construction))',
  'hsl(var(--lca-eol))'
];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={lcaData}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {lcaData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

## 🎯 Sidebar Navigation

```tsx
<aside className="bg-sidebar text-sidebar-foreground min-h-screen p-6">
  <nav className="space-y-2">
    {/* Active Link */}
    <a 
      href="/dashboard"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground shadow-glow transition-all"
    >
      <LayoutDashboard className="h-5 w-5" />
      <span className="font-medium">Dashboard</span>
    </a>

    {/* Hover Link */}
    <a 
      href="/calculator"
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
    >
      <Calculator className="h-5 w-5" />
      <span>Calculator</span>
    </a>

    {/* With Badge */}
    <a 
      href="/reports"
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-all group"
    >
      <FileText className="h-5 w-5" />
      <span>Reports</span>
      <Badge className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground">
        3
      </Badge>
    </a>
  </nav>
</aside>
```

## 🎨 Text Gradient Effects

```tsx
<div className="text-center space-y-4">
  <h1 className="text-5xl font-bold text-gradient gradient-primary">
    Carbon Emissions
  </h1>
  
  <h2 className="text-3xl font-semibold text-gradient gradient-eco">
    Sustainable Building
  </h2>
  
  <p className="text-xl text-gradient gradient-sunset">
    Reduce Your Carbon Footprint
  </p>
</div>
```

## 📱 Responsive Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects.map((project, index) => (
    <Card 
      key={project.id}
      className="animate-fade-in shadow-carbon hover:shadow-elevated transition-all"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="gradient-carbon text-white">
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Emissions</span>
            <span className="font-bold">{project.total} tCO₂e</span>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-scope-1 text-white">{project.scope1}</Badge>
            <Badge className="bg-scope-2 text-white">{project.scope2}</Badge>
            <Badge className="bg-scope-3 text-white">{project.scope3}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

## 🔔 Toast Notifications

```tsx
import { toast } from 'sonner';

// Success Toast
toast.success('Emissions calculated successfully', {
  description: 'Your carbon footprint has been updated',
  className: 'border-success bg-success/10'
});

// Warning Toast
toast.warning('High emissions detected', {
  description: 'Consider reviewing Scope 1 activities',
  className: 'border-warning bg-warning/10'
});

// Error Toast
toast.error('Calculation failed', {
  description: 'Please check your input data',
  className: 'border-destructive bg-destructive/10'
});
```

## 🎯 Button Variants

```tsx
<div className="flex flex-wrap gap-4">
  {/* Primary Action */}
  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-carbon">
    Calculate Emissions
  </Button>

  {/* Secondary Action */}
  <Button variant="secondary" className="hover:shadow-glow transition-all">
    View Reports
  </Button>

  {/* Destructive Action */}
  <Button variant="destructive" className="hover:scale-105 transition-transform">
    Delete Project
  </Button>

  {/* Outline with Custom Color */}
  <Button variant="outline" className="border-compliance-gbca text-compliance-gbca hover:bg-compliance-gbca hover:text-white">
    Export PDF
  </Button>

  {/* Gradient Button */}
  <Button className="gradient-eco text-white hover:opacity-90 transition-opacity">
    Get Started
  </Button>
</div>
```

## 🏗️ Data Table Styling

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-muted/50">
      <TableHead>Activity</TableHead>
      <TableHead>Scope</TableHead>
      <TableHead className="text-right">Emissions (tCO₂e)</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-muted/30 transition-colors animate-fade-in">
      <TableCell className="font-medium">Diesel Combustion</TableCell>
      <TableCell>
        <Badge className="bg-scope-1 text-white">Scope 1</Badge>
      </TableCell>
      <TableCell className="text-right text-scope-1 font-bold">456.7</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

These examples demonstrate the comprehensive Tailwind configuration in practical use cases throughout the Carbon Construct application. The design system provides a consistent, accessible, and visually appealing interface for carbon emissions tracking and compliance reporting.
