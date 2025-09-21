import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Calculator, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Scope 1 schema for direct emissions
const scope1Schema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  fuel_combustion: z.array(z.object({
    fuel_type: z.string().min(1, "Fuel type is required"),
    equipment_type: z.string().min(1, "Equipment type is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    operating_hours: z.number().min(0, "Operating hours must be positive"),
    notes: z.string().optional(),
  })),
  vehicles: z.array(z.object({
    vehicle_type: z.string().min(1, "Vehicle type is required"),
    fuel_type: z.string().min(1, "Fuel type is required"),
    distance_km: z.number().min(0, "Distance must be positive"),
    fuel_consumption: z.number().min(0, "Fuel consumption must be positive"),
    notes: z.string().optional(),
  })),
  processes: z.array(z.object({
    process_type: z.string().min(1, "Process type is required"),
    material_type: z.string().optional(),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    emission_factor: z.number().min(0, "Emission factor must be positive"),
    notes: z.string().optional(),
  })),
  fugitive: z.array(z.object({
    emission_source: z.string().min(1, "Emission source is required"),
    refrigerant_type: z.string().optional(),
    quantity_leaked: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    gwp_factor: z.number().min(0, "GWP factor must be positive"),
    notes: z.string().optional(),
  })),
});

type Scope1FormData = z.infer<typeof scope1Schema>;

const fuelTypes = [
  "Diesel", "Petrol", "LPG", "Natural Gas", "Heavy Fuel Oil", "Biodiesel", "Ethanol"
];

const equipmentTypes = [
  "Generators", "Boilers", "Heaters", "Compressors", "Pumps", "Cranes", "Excavators", "Bulldozers"
];

const vehicleTypes = [
  "Light Commercial Vehicle", "Heavy Truck", "Delivery Van", "Site Vehicle", "Forklift", "Crane Mobile"
];

const processTypes = [
  "Concrete Production", "Steel Welding", "Chemical Processes", "Cement Production", "Lime Production"
];

const refrigerantTypes = [
  "R-134a", "R-404A", "R-410A", "R-22", "R-407C", "R-32", "CO2", "Ammonia"
];

export default function Scope1() {
  const { toast } = useToast();
  
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
    try {
      // TODO: Save to Supabase
      console.log("Scope 1 data:", data);
      toast({
        title: "Success",
        description: "Scope 1 emissions data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save emissions data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-scope-1">Scope 1: Direct Emissions</h1>
          <p className="text-muted-foreground mt-2">
            Calculate emissions from sources directly owned or controlled by your organization
          </p>
        </div>
        <Badge variant="secondary" className="text-scope-1 border-scope-1/20">
          Australian NCC Compliant
        </Badge>
      </div>

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fuel">Fuel Combustion</TabsTrigger>
              <TabsTrigger value="vehicles">Company Vehicles</TabsTrigger>
              <TabsTrigger value="processes">Industrial Processes</TabsTrigger>
              <TabsTrigger value="fugitive">Fugitive Emissions</TabsTrigger>
            </TabsList>

            <TabsContent value="fuel">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Fuel Combustion
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fuel type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fuelTypes.map((fuel) => (
                                    <SelectItem key={fuel} value={fuel.toLowerCase().replace(" ", "_")}>
                                      {fuel}
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
                          name={`fuel_combustion.${index}.equipment_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Equipment Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {equipmentTypes.map((equipment) => (
                                    <SelectItem key={equipment} value={equipment.toLowerCase().replace(" ", "_")}>
                                      {equipment}
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
                          name={`fuel_combustion.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity Consumed</FormLabel>
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
                              <FormLabel>Operating Hours</FormLabel>
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
                  <CardTitle>Company Vehicles</CardTitle>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vehicleTypes.map((vehicle) => (
                                    <SelectItem key={vehicle} value={vehicle.toLowerCase().replace(" ", "_")}>
                                      {vehicle}
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
                          name={`vehicles.${index}.fuel_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fuel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fuelTypes.map((fuel) => (
                                    <SelectItem key={fuel} value={fuel.toLowerCase().replace(" ", "_")}>
                                      {fuel}
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select process" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {processTypes.map((process) => (
                                    <SelectItem key={process} value={process.toLowerCase().replace(" ", "_")}>
                                      {process}
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select refrigerant" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {refrigerantTypes.map((refrigerant) => (
                                    <SelectItem key={refrigerant} value={refrigerant.toLowerCase().replace("-", "_")}>
                                      {refrigerant}
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
            <Button type="submit" size="lg" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Scope 1 Data
            </Button>
            <Button type="button" variant="outline" size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Emissions
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}