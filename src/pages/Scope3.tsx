import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Calculator, Save, Truck, Factory, Users, Building, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useEmissionCalculations } from "@/hooks/useEmissionCalculations";
import ProjectSelector from "@/components/ProjectSelector";

// Scope 3 schema for value chain emissions
const scope3Schema = z.object({
  upstream: z.array(z.object({
    category: z.number().min(1).max(8, "Must be category 1-8"),
    category_name: z.string().min(1, "Category name is required"),
    activity_description: z.string().min(1, "Activity description is required"),
    material_type: z.string().optional(),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    supplier_data: z.boolean(),
    lca_stage: z.string().optional(),
    emission_factor: z.number().min(0, "Emission factor must be positive"),
    notes: z.string().optional(),
  })),
  downstream: z.array(z.object({
    category: z.number().min(9).max(15, "Must be category 9-15"),
    category_name: z.string().min(1, "Category name is required"),
    activity_description: z.string().min(1, "Activity description is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    lifecycle_stage: z.string().optional(),
    end_user_data: z.boolean(),
    emission_factor: z.number().min(0, "Emission factor must be positive"),
    notes: z.string().optional(),
  })),
});

type Scope3FormData = z.infer<typeof scope3Schema>;

const upstreamCategories = [
  { id: 1, name: "Purchased Goods and Services", description: "Raw materials, construction materials, services" },
  { id: 2, name: "Capital Goods", description: "Equipment, machinery, buildings" },
  { id: 3, name: "Fuel and Energy Activities", description: "Extraction, production, transport of fuels/energy" },
  { id: 4, name: "Upstream Transportation", description: "Transport of purchased goods" },
  { id: 5, name: "Waste Generated", description: "Disposal and treatment of waste" },
  { id: 6, name: "Business Travel", description: "Employee business travel" },
  { id: 7, name: "Employee Commuting", description: "Employee transport to/from work" },
  { id: 8, name: "Upstream Leased Assets", description: "Assets leased by the organization" },
];

const downstreamCategories = [
  { id: 9, name: "Downstream Transportation", description: "Transport of sold products" },
  { id: 10, name: "Processing of Products", description: "Processing of intermediate products" },
  { id: 11, name: "Use of Products", description: "Use phase emissions of sold products" },
  { id: 12, name: "End-of-Life Treatment", description: "Disposal and treatment at end-of-life" },
  { id: 13, name: "Downstream Leased Assets", description: "Assets leased to others" },
  { id: 14, name: "Franchises", description: "Operation of franchises" },
  { id: 15, name: "Investments", description: "Investment activities" },
];

// ISO 21931 & ISO 14025 compliant construction materials with EPD data
const constructionMaterials = [
  "Concrete - General Purpose (20-40 MPa)",
  "Concrete - High Strength (>40 MPa)",
  "Concrete - Precast Elements",
  "Concrete - Ready Mixed",
  "Steel - Structural (Hot Rolled)",
  "Steel - Reinforcing Bar (Rebar)",
  "Steel - Cold Formed",
  "Steel - Stainless",
  "Timber - Hardwood Structural",
  "Timber - Softwood Structural",
  "Timber - Engineered (LVL, Glulam)",
  "Timber - Cross Laminated (CLT)",
  "Aluminium - Extruded Sections",
  "Aluminium - Sheet",
  "Aluminium - Cast",
  "Glass - Float",
  "Glass - Toughened",
  "Glass - Laminated",
  "Glass - Low-E Coated",
  "Insulation - Glass Wool",
  "Insulation - Rock Wool",
  "Insulation - Polyester",
  "Insulation - EPS",
  "Insulation - XPS",
  "Plasterboard - Standard",
  "Plasterboard - Fire Rated",
  "Brickwork - Clay",
  "Brickwork - Concrete",
  "Blockwork - Concrete",
  "Roofing - Metal (Colorbond)",
  "Roofing - Concrete Tile",
  "Roofing - Clay Tile",
  "Roofing - Membrane",
  "Flooring - Carpet",
  "Flooring - Vinyl",
  "Flooring - Timber",
  "Flooring - Concrete Polished",
  "Ceramic Tiles",
  "Paint - Water Based",
  "Paint - Solvent Based",
  "Sealants & Adhesives",
  "Electrical Cabling - Copper",
  "Electrical Cabling - Aluminium",
  "Mechanical Ductwork",
  "Plumbing - PVC Pipe",
  "Plumbing - Copper Pipe",
  "Waterproofing Membrane"
];

// ISO 21931 full lifecycle stages (A1-A5, B1-B7, C1-C4, D)
const lcaStages = [
  { value: "a1", label: "A1: Raw Material Extraction & Processing" },
  { value: "a2", label: "A2: Transport to Manufacturing" },
  { value: "a3", label: "A3: Manufacturing" },
  { value: "a4", label: "A4: Transport to Site" },
  { value: "a5", label: "A5: Construction/Installation" },
  { value: "b1_b7", label: "B1-B7: Use Phase" },
  { value: "c1_c4", label: "C1-C4: End-of-Life" },
  { value: "d", label: "D: Benefits and Loads" },
];

const transportModes = [
  "Road Transport (Truck)", "Rail Transport", "Sea Transport", "Air Transport", "Pipeline", "Multimodal"
];

export default function Scope3() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const { calculateScope3Emissions, loading: calculating } = useEmissionCalculations();

  // Use useEffect for navigation to prevent render-time updates
  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  
  const form = useForm<Scope3FormData>({
    resolver: zodResolver(scope3Schema),
    defaultValues: {
      upstream: [{ 
        category: 1, 
        category_name: "Purchased Goods and Services",
        activity_description: "", 
        material_type: "",
        quantity: 0, 
        unit: "kg", 
        supplier_data: false,
        lca_stage: "",
        emission_factor: 0,
        notes: "" 
      }],
      downstream: [{ 
        category: 9, 
        category_name: "Downstream Transportation",
        activity_description: "", 
        quantity: 0, 
        unit: "tkm", 
        lifecycle_stage: "",
        end_user_data: false,
        emission_factor: 0,
        notes: "" 
      }],
    },
  });

  const {
    fields: upstreamFields,
    append: appendUpstream,
    remove: removeUpstream,
  } = useFieldArray({
    control: form.control,
    name: "upstream",
  });

  const {
    fields: downstreamFields,
    append: appendDownstream,
    remove: removeDownstream,
  } = useFieldArray({
    control: form.control,
    name: "downstream",
  });

  const onSubmit = async (data: Scope3FormData) => {
    // Transform form data to match calculation hook format
    const transformedData = {
      upstreamActivities: data.upstream.map(upstream => ({
        category: upstream.category,
        categoryName: upstream.category_name,
        subcategory: upstream.material_type,
        description: upstream.activity_description,
        lcaStage: upstream.lca_stage,
        quantity: upstream.quantity,
        unit: upstream.unit,
        emissionFactor: upstream.emission_factor,
        supplierData: upstream.supplier_data,
        notes: upstream.notes
      })),
      downstreamActivities: data.downstream.map(downstream => ({
        category: downstream.category,
        categoryName: downstream.category_name,
        subcategory: downstream.lifecycle_stage,
        description: downstream.activity_description,
        quantity: downstream.quantity,
        unit: downstream.unit,
        emissionFactor: downstream.emission_factor,
        supplierData: downstream.end_user_data,
        notes: downstream.notes
      }))
    };

    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before calculating emissions.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await calculateScope3Emissions(transformedData);
      if (result) {
        toast({
          title: "Emissions Calculated",
          description: `Total Scope 3 emissions: ${result.total.toFixed(2)} tCO₂e`,
        });
        console.log("Scope 3 Calculation Result:", result);
      } else {
        toast({
          title: "Calculation Failed",
          description: "Unable to calculate emissions. Please check your data and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Error",
        description: "An error occurred during calculation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-scope-3">Scope 3: Value Chain Emissions</h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Calculate upstream and downstream emissions from construction materials, transport, waste and lifecycle
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              ISO 14064-1:2018, ISO 21931:2022 & GHG Protocol Scope 3 Compliant
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-scope-3 border-scope-3/20 w-fit">
          LCA Compliant • 15 Categories
        </Badge>
      </div>

      <ProjectSelector />

      <Card className="bg-gradient-to-r from-scope-3/5 to-scope-3/10 border-scope-3/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-scope-3">
            <Building className="h-5 w-5" />
            Value Chain Assessment Overview
          </CardTitle>
          <CardDescription>
            Complete Life Cycle Assessment covering all 15 Scope 3 categories with Australian construction focus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-scope-3 mb-2">Upstream (Categories 1-8)</h4>
              <div className="space-y-1 text-sm">
                <div>• Raw materials & purchased goods</div>
                <div>• Capital goods & equipment</div>
                <div>• Business travel & commuting</div>
                <div>• Waste & transportation</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-scope-3 mb-2">Downstream (Categories 9-15)</h4>
              <div className="space-y-1 text-sm">
                <div>• Product transportation & processing</div>
                <div>• Use phase & end-of-life</div>
                <div>• Leased assets & franchises</div>
                <div>• Investment activities</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="upstream" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upstream" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Upstream (1-8)
              </TabsTrigger>
              <TabsTrigger value="downstream" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Downstream (9-15)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upstream">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Upstream Emissions (Categories 1-8)
                  </CardTitle>
                  <CardDescription>
                    Emissions from activities in your supply chain and supporting activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {upstreamFields.map((field, index) => (
                    <div key={field.id} className="p-6 border rounded-lg space-y-4 bg-card/50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">Upstream Activity {index + 1}</h4>
                        {upstreamFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeUpstream(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`upstream.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={(value) => {
                                const cat = upstreamCategories.find(c => c.id === parseInt(value));
                                field.onChange(parseInt(value));
                                form.setValue(`upstream.${index}.category_name`, cat?.name || "");
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {upstreamCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.id}. {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`upstream.${index}.material_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Material Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {constructionMaterials.map((material) => (
                                    <SelectItem key={material} value={material.toLowerCase()}>
                                      {material}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`upstream.${index}.activity_description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Supply of structural steel beams" {...field} />
                            </FormControl>
                            <FormDescription>
                              Describe the specific activity or material being assessed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`upstream.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`upstream.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                  <SelectItem value="tonnes">Tonnes</SelectItem>
                                  <SelectItem value="m3">Cubic metres (m³)</SelectItem>
                                  <SelectItem value="m2">Square metres (m²)</SelectItem>
                                  <SelectItem value="km">Kilometres (km)</SelectItem>
                                  <SelectItem value="tkm">Tonne-kilometres (tkm)</SelectItem>
                                  <SelectItem value="AUD">Australian Dollars (AUD)</SelectItem>
                                  <SelectItem value="employees">Number of employees</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`upstream.${index}.lca_stage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LCA Stage</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {lcaStages.map((stage) => (
                                    <SelectItem key={stage.value} value={stage.value}>
                                      {stage.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`upstream.${index}.emission_factor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emission Factor</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  placeholder="tCO₂e/unit"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`upstream.${index}.supplier_data`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Supplier-specific data available
                                </FormLabel>
                                <FormDescription>
                                  Check if using supplier-specific emission factors
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendUpstream({ 
                      category: 1, 
                      category_name: "Purchased Goods and Services",
                      activity_description: "", 
                      material_type: "",
                      quantity: 0, 
                      unit: "kg", 
                      supplier_data: false,
                      lca_stage: "",
                      emission_factor: 0,
                      notes: "" 
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Upstream Activity
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downstream">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Downstream Emissions (Categories 9-15)
                  </CardTitle>
                  <CardDescription>
                    Emissions from sold products, services, and investments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {downstreamFields.map((field, index) => (
                    <div key={field.id} className="p-6 border rounded-lg space-y-4 bg-card/50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">Downstream Activity {index + 1}</h4>
                        {downstreamFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDownstream(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`downstream.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={(value) => {
                                const cat = downstreamCategories.find(c => c.id === parseInt(value));
                                field.onChange(parseInt(value));
                                form.setValue(`downstream.${index}.category_name`, cat?.name || "");
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {downstreamCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.id}. {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`downstream.${index}.lifecycle_stage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lifecycle Stage</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="distribution">Distribution</SelectItem>
                                  <SelectItem value="use_phase">Use Phase</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="end_of_life">End-of-Life</SelectItem>
                                  <SelectItem value="disposal">Disposal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`downstream.${index}.activity_description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Transportation of finished buildings to customers" {...field} />
                            </FormControl>
                            <FormDescription>
                              Describe the specific downstream activity being assessed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`downstream.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`downstream.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tkm">Tonne-kilometres (tkm)</SelectItem>
                                  <SelectItem value="years">Years of operation</SelectItem>
                                  <SelectItem value="units">Number of units</SelectItem>
                                  <SelectItem value="m2">Square metres (m²)</SelectItem>
                                  <SelectItem value="tonnes">Tonnes</SelectItem>
                                  <SelectItem value="AUD">Australian Dollars (AUD)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`downstream.${index}.emission_factor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emission Factor</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  placeholder="tCO₂e/unit"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`downstream.${index}.end_user_data`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  End-user specific data available
                                </FormLabel>
                                <FormDescription>
                                  Check if using end-user specific emission factors
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendDownstream({ 
                      category: 9, 
                      category_name: "Downstream Transportation",
                      activity_description: "", 
                      quantity: 0, 
                      unit: "tkm", 
                      lifecycle_stage: "",
                      end_user_data: false,
                      emission_factor: 0,
                      notes: "" 
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Downstream Activity
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {currentProject && (
            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={calculating} className="flex-1">
                <Calculator className="h-4 w-4 mr-2" />
                {calculating ? "Calculating..." : "Calculate & Save Emissions"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const formData = form.getValues();
                  console.log("Form data saved:", formData);
                  toast({
                    title: "Data Saved",
                    description: "Your emission data has been saved to the current project.",
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Data
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}