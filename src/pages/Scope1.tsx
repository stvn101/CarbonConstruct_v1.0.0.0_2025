import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Calculator, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NumberInputWithPresets } from "@/components/ui/number-input-with-presets";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useEmissionCalculations } from "@/hooks/useEmissionCalculations";
import ProjectSelector from "@/components/ProjectSelector";
import {
  operatingHoursPresets,
  fuelQuantityPresets,
  distancePresets,
  fuelConsumptionPresets,
  materialQuantityPresets,
  refrigerantQuantityPresets,
  gwpFactorPresets,
  emissionFactorPresets,
} from "@/lib/calculator-presets";

// Scope 1 schema for direct emissions - Made more flexible for easier use
const scope1Schema = z.object({
  project_name: z.string().optional(),
  fuel_combustion: z.array(z.object({
    fuel_type: z.string().optional(),
    equipment_type: z.string().optional(),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    operating_hours: z.number().min(0, "Operating hours must be positive"),
    notes: z.string().optional(),
  })),
  vehicles: z.array(z.object({
    vehicle_type: z.string().optional(),
    fuel_type: z.string().optional(),
    distance_km: z.number().min(0, "Distance must be positive"),
    fuel_consumption: z.number().min(0, "Fuel consumption must be positive"),
    notes: z.string().optional(),
  })),
  processes: z.array(z.object({
    process_type: z.string().optional(),
    material_type: z.string().optional(),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    emission_factor: z.number().min(0, "Emission factor must be positive"),
    notes: z.string().optional(),
  })),
  fugitive: z.array(z.object({
    emission_source: z.string().optional(),
    refrigerant_type: z.string().optional(),
    quantity_leaked: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    gwp_factor: z.number().min(0, "GWP factor must be positive"),
    notes: z.string().optional(),
  })),
});

type Scope1FormData = z.infer<typeof scope1Schema>;

// ISO 14067:2018 Compliant - Construction-specific fuel types
const fuelTypes = [
  "Diesel - Construction Equipment",
  "Diesel - B20 Biodiesel Blend", 
  "Petrol - Unleaded",
  "LPG - Liquefied Petroleum Gas",
  "Natural Gas - Pipeline",
  "Natural Gas - Compressed (CNG)",
  "Heavy Fuel Oil",
  "Aviation Gasoline (AvGas)",
  "Biodiesel B100",
  "Ethanol E10"
];

// Construction-specific equipment aligned with ISO 21931
const equipmentTypes = [
  "Diesel Generator - Portable",
  "Diesel Generator - Stationary",
  "Concrete Batching Plant",
  "Asphalt Plant - Batch",
  "Asphalt Plant - Drum Mix",
  "Mobile Crane - Diesel",
  "Tower Crane - Electric",
  "Excavator - Hydraulic",
  "Bulldozer - Tracked",
  "Loader - Front End",
  "Backhoe - Diesel",
  "Concrete Pump - Truck Mounted",
  "Concrete Mixer - Mobile",
  "Compressor - Air (Diesel)",
  "Welding Equipment - Gas",
  "Piling Equipment - Diesel",
  "Road Roller - Vibratory",
  "Grader - Motor",
  "Forklift - LPG",
  "Lighting Tower - Diesel"
];

// Construction site vehicles - ISO compliant categories
const vehicleTypes = [
  "Light Commercial Vehicle (<3.5t)",
  "Medium Rigid Truck (3.5-12t)",
  "Heavy Rigid Truck (>12t)",
  "Articulated Truck",
  "Concrete Agitator Truck",
  "Tipper Truck - Rigid",
  "Tipper Truck - Articulated",
  "Flatbed Truck",
  "Crane Truck - Mobile",
  "Service Vehicle - 4WD",
  "Site Utility Vehicle",
  "Forklift - Diesel",
  "Forklift - LPG",
  "Telehandler"
];

// Construction process emissions - ISO 14067 compliant
const processTypes = [
  "On-site Concrete Production",
  "Concrete Curing - Accelerated",
  "Steel Cutting & Welding",
  "Hot Works - Gas Cutting",
  "Spray Painting - Solvent Based",
  "Spray Painting - Water Based",
  "Asphalt Laying & Compaction",
  "Bitumen Heating",
  "Acetylene Welding",
  "Thermal Cutting",
  "Surface Coating Application",
  "Adhesive Application",
  "Sealant Application",
  "Lime Slaking",
  "Cement Kiln Operation"
];

// Construction refrigerants - ISO 817 & GWP factors
const refrigerantTypes = [
  "R-134a (GWP: 1,430)",
  "R-404A (GWP: 3,922)",
  "R-410A (GWP: 2,088)",
  "R-407C (GWP: 1,774)",
  "R-32 (GWP: 675)",
  "R-290 Propane (GWP: 3)",
  "R-600a Isobutane (GWP: 3)",
  "R-717 Ammonia (GWP: 0)",
  "R-744 CO2 (GWP: 1)",
  "HFO-1234yf (GWP: 4)"
];

export default function Scope1() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const { calculateScope1Emissions, loading: calculating } = useEmissionCalculations();

  // Use useEffect for navigation to prevent render-time updates
  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  
  const form = useForm<Scope1FormData>({
    resolver: zodResolver(scope1Schema),
    defaultValues: {
      project_name: "",
      fuel_combustion: [{ fuel_type: "", equipment_type: "", quantity: 0, unit: "L", operating_hours: 0, notes: "" }],
      vehicles: [{ vehicle_type: "", fuel_type: "", distance_km: 0, fuel_consumption: 0, notes: "" }],
      processes: [{ process_type: "", material_type: "", quantity: 0, unit: "kg", emission_factor: 0, notes: "" }],
      fugitive: [{ emission_source: "", refrigerant_type: "", quantity_leaked: 0, unit: "kg", gwp_factor: 0, notes: "" }],
    },
  });

  const {
    fields: fuelFields,
    append: appendFuel,
    remove: removeFuel,
  } = useFieldArray({
    control: form.control,
    name: "fuel_combustion",
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control: form.control,
    name: "vehicles",
  });

  const {
    fields: processFields,
    append: appendProcess,
    remove: removeProcess,
  } = useFieldArray({
    control: form.control,
    name: "processes",
  });

  const {
    fields: fugitiveFields,
    append: appendFugitive,
    remove: removeFugitive,
  } = useFieldArray({
    control: form.control,
    name: "fugitive",
  });

  const onSubmit = async (data: Scope1FormData) => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before calculating emissions.",
        variant: "destructive",
      });
      return;
    }

    console.log("=== Scope 1 Calculation Started ===");
    console.log("Project:", currentProject.name);
    console.log("Raw form data:", data);

    try {
      // Filter out empty entries and transform form data
      const transformedData = {
        fuelCombustion: data.fuel_combustion
          .filter(fuel => fuel.quantity > 0 && fuel.fuel_type && fuel.equipment_type)
          .map(fuel => ({
            fuelType: fuel.fuel_type,
            quantity: fuel.quantity,
            unit: fuel.unit,
            notes: fuel.notes
          })),
        vehicles: data.vehicles
          .filter(vehicle => vehicle.distance_km > 0 && vehicle.vehicle_type && vehicle.fuel_type)
          .map(vehicle => ({
            vehicleType: vehicle.vehicle_type,
            fuelType: vehicle.fuel_type,
            quantity: vehicle.distance_km,
            unit: 'km',
            notes: vehicle.notes
          })),
        processes: data.processes
          .filter(process => process.quantity > 0 && process.process_type)
          .map(process => ({
            processType: process.process_type,
            quantity: process.quantity,
            unit: process.unit,
            notes: process.notes
          })),
        fugitiveEmissions: data.fugitive
          .filter(fugitive => fugitive.quantity_leaked > 0 && fugitive.emission_source)
          .map(fugitive => ({
            refrigerantType: fugitive.refrigerant_type || fugitive.emission_source,
            quantity: fugitive.quantity_leaked,
            unit: fugitive.unit,
            notes: fugitive.notes
          }))
      };

      console.log("Filtered valid entries:");
      console.log("  - Fuel combustion:", transformedData.fuelCombustion.length);
      console.log("  - Vehicles:", transformedData.vehicles.length);
      console.log("  - Processes:", transformedData.processes.length);
      console.log("  - Fugitive emissions:", transformedData.fugitiveEmissions.length);
      console.log("Transformed data for calculation:", transformedData);

      const result = await calculateScope1Emissions(transformedData);
      
      console.log("=== Calculation Complete ===");
      console.log("Result:", result);

      if (result && result.total > 0) {
        toast({
          title: "Calculation Successful",
          description: `Total Scope 1 emissions: ${result.total.toFixed(2)} tCO₂e (${result.emissions.length} entries saved)`,
        });
        
        console.log("✓ Successfully saved to database");
        
        // Navigate back to dashboard after successful calculation
        setTimeout(() => navigate("/"), 2000);
      } else if (result && result.total === 0) {
        console.warn("⚠ Calculation returned zero emissions");
        toast({
          title: "No Emissions Calculated",
          description: "Please ensure you have entered valid data with quantities greater than 0.",
          variant: "destructive",
        });
      } else {
        console.error("✗ Calculation failed - no result returned");
        toast({
          title: "Calculation Failed",
          description: "Unable to calculate emissions. Please check your data and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("✗ Calculation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during calculation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-8">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-fit touch-target">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-scope-1">Scope 1: Direct Emissions</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1">
            Calculate emissions from sources directly owned or controlled by your construction project
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">
            ISO 14064-1:2018 & ISO 14067:2018 Compliant
          </p>
        </div>
        <Badge variant="secondary" className="text-scope-1 border-scope-1/20 w-fit text-xs">
          Australian NCC Compliant
        </Badge>
      </div>

      <ProjectSelector />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Scope 1 covers direct emissions from sources you own or control: fuel combustion, company vehicles, industrial processes, and fugitive emissions (e.g., refrigerant leaks).
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic details about your carbon assessment project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="fuel" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
              <TabsTrigger value="fuel" className="text-xs sm:text-sm px-2 py-2.5">Fuel</TabsTrigger>
              <TabsTrigger value="vehicles" className="text-xs sm:text-sm px-2 py-2.5">Vehicles</TabsTrigger>
              <TabsTrigger value="processes" className="text-xs sm:text-sm px-2 py-2.5">Processes</TabsTrigger>
              <TabsTrigger value="fugitive" className="text-xs sm:text-sm px-2 py-2.5">Fugitive</TabsTrigger>
            </TabsList>

            <TabsContent value="fuel">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Fuel Combustion
                    <InfoTooltip content="Enter data for diesel generators, batching plants, and other stationary equipment that burns fuel. Select from common fuel quantities or enter your exact values." />
                  </CardTitle>
                  <CardDescription>
                    Direct emissions from burning fossil fuels in stationary equipment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fuelFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Fuel Source {index + 1}</h4>
                        {fuelFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFuel(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`fuel_combustion.${index}.fuel_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={fuelTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select fuel type"
                                searchPlaceholder="Search fuel types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`fuel_combustion.${index}.equipment_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={equipmentTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select equipment"
                                searchPlaceholder="Search equipment types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`fuel_combustion.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Quantity Consumed
                                <InfoTooltip content="Select a common fuel quantity or enter your exact amount. Standard values are provided based on typical construction equipment." />
                              </FormLabel>
                              <FormControl>
                                <NumberInputWithPresets
                                  value={field.value}
                                  onChange={field.onChange}
                                  presets={fuelQuantityPresets}
                                  placeholder="Select or enter quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`fuel_combustion.${index}.unit`}
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
                                  <SelectItem value="L">Litres (L)</SelectItem>
                                  <SelectItem value="kL">Kilolitres (kL)</SelectItem>
                                  <SelectItem value="m3">Cubic Metres (m³)</SelectItem>
                                  <SelectItem value="GJ">Gigajoules (GJ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fuel_combustion.${index}.operating_hours`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Operating Hours
                                <InfoTooltip content="Select typical shift patterns (8hr single shift, 16hr double shift, 24hr continuous) or enter your actual operating hours." />
                              </FormLabel>
                              <FormControl>
                                <NumberInputWithPresets
                                  value={field.value}
                                  onChange={field.onChange}
                                  presets={operatingHoursPresets}
                                  placeholder="Select or enter hours"
                                  unit="hours"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fuel_combustion.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Input placeholder="Additional notes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendFuel({ fuel_type: "", equipment_type: "", quantity: 0, unit: "L", operating_hours: 0, notes: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fuel Source
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle>Company Vehicles
                    <InfoTooltip content="Track emissions from trucks, vans, and other vehicles used for construction. Enter distances traveled and select from typical fuel consumption rates or enter exact values." />
                  </CardTitle>
                  <CardDescription>
                    Emissions from vehicles owned or leased by your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicleFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Vehicle {index + 1}</h4>
                        {vehicleFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVehicle(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.vehicle_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={vehicleTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select vehicle"
                                searchPlaceholder="Search vehicle types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`vehicles.${index}.fuel_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={fuelTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select fuel"
                                searchPlaceholder="Search fuel types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`vehicles.${index}.distance_km`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distance (km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
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
                          name={`vehicles.${index}.fuel_consumption`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Consumption (L/100km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendVehicle({ vehicle_type: "", fuel_type: "", distance_km: 0, fuel_consumption: 0, notes: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processes">
              <Card>
                <CardHeader>
                  <CardTitle>Industrial Processes</CardTitle>
                  <CardDescription>
                    Emissions from industrial and chemical processes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {processFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Process {index + 1}</h4>
                        {processFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProcess(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`processes.${index}.process_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Process Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={processTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select process"
                                searchPlaceholder="Search process types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`processes.${index}.quantity`}
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
                          name={`processes.${index}.emission_factor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emission Factor (tCO₂e/unit)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendProcess({ process_type: "", material_type: "", quantity: 0, unit: "kg", emission_factor: 0, notes: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Process
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fugitive">
              <Card>
                <CardHeader>
                  <CardTitle>Fugitive Emissions</CardTitle>
                  <CardDescription>
                    Intentional or unintentional releases (refrigerants, chemical leaks)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fugitiveFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Fugitive Source {index + 1}</h4>
                        {fugitiveFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFugitive(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`fugitive.${index}.emission_source`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emission Source</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., HVAC System" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      <FormField
                        control={form.control}
                        name={`fugitive.${index}.refrigerant_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Refrigerant Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={refrigerantTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select refrigerant"
                                searchPlaceholder="Search refrigerants..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`fugitive.${index}.quantity_leaked`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity Leaked (kg)</FormLabel>
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
                          name={`fugitive.${index}.gwp_factor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GWP Factor</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendFugitive({ emission_source: "", refrigerant_type: "", quantity_leaked: 0, unit: "kg", gwp_factor: 0, notes: "" })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fugitive Source
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={calculating} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
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
                  description: "Your emission data has been saved locally.",
                });
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}