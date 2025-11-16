import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Calculator, Save, Zap, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { NumberInputWithPresets } from "@/components/ui/number-input-with-presets";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { useEmissionCalculations } from "@/hooks/useEmissionCalculations";
import ProjectSelector from "@/components/ProjectSelector";
import {
  electricityQuantityPresets,
  greenPowerPresets,
  operatingHoursPresets,
  efficiencyRatingPresets,
  materialQuantityPresets,
} from "@/lib/calculator-presets";

// Australian states with district steam infrastructure
const STATES_WITH_STEAM = ['nsw', 'vic', 'act'];

// Scope 2 schema for energy emissions
const scope2Schema = z.object({
  electricity: z.array(z.object({
    state_region: z.string().min(1, "State/region is required"),
    energy_source: z.string().min(1, "Energy source is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.string().min(1, "Unit is required"),
    green_power_percentage: z.number().min(0).max(100, "Must be between 0-100"),
    supplier_name: z.string().optional(),
    tariff_type: z.string().optional(),
    notes: z.string().optional(),
  })),
  heating_cooling: z.array(z.object({
    state_region: z.string().min(1, "State/region is required"),
    system_type: z.string().min(1, "System type is required"),
    energy_source: z.string().min(1, "Energy source is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.string().min(1, "Unit is required"),
    efficiency_rating: z.number().min(0.01, "Efficiency must be greater than 0"),
    operating_hours: z.number().min(0.01, "Operating hours must be greater than 0"),
    notes: z.string().optional(),
  })),
  purchased_steam: z.array(z.object({
    state_region: z.string().min(1, "State/region is required"),
    steam_source: z.string().min(1, "Steam source is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.string().min(1, "Unit is required"),
    pressure_rating: z.string().optional(),
    supplier_name: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

type Scope2FormData = z.infer<typeof scope2Schema>;

const australianStates = [
  { value: "nsw", label: "New South Wales (NSW)" },
  { value: "vic", label: "Victoria (VIC)" },
  { value: "qld", label: "Queensland (QLD)" },
  { value: "wa", label: "Western Australia (WA)" },
  { value: "sa", label: "South Australia (SA)" },
  { value: "tas", label: "Tasmania (TAS)" },
  { value: "act", label: "Australian Capital Territory (ACT)" },
  { value: "nt", label: "Northern Territory (NT)" },
];

// ISO 14064-1 compliant energy sources with Australian state emission factors
const energySources = [
  "Grid Electricity - Black Coal",
  "Grid Electricity - Brown Coal",
  "Grid Electricity - Natural Gas",
  "Grid Electricity - Mixed (State Average)",
  "Solar PV - Rooftop",
  "Solar PV - Ground Mounted",
  "Wind - Onshore",
  "Wind - Offshore",
  "Hydro - Large Scale",
  "Hydro - Small Scale",
  "Natural Gas - Pipeline",
  "Natural Gas - LNG",
  "Biomass - Wood",
  "Biomass - Agricultural Waste",
  "Diesel - Backup Generation",
  "Battery Storage - Discharge"
];

// Construction site HVAC systems - ISO 52000 compliant
const systemTypes = [
  "Site Office HVAC - Split System",
  "Site Office HVAC - Ducted",
  "Portable Air Conditioner",
  "Site Heater - Electric",
  "Site Heater - Gas (LPG)",
  "Site Heater - Diesel",
  "Industrial Chiller - Water Cooled",
  "Industrial Chiller - Air Cooled",
  "Heat Pump - Air Source",
  "Heat Pump - Ground Source",
  "Radiant Heater - Gas",
  "Radiant Heater - Electric",
  "Evaporative Cooler",
  "Ventilation Fan - Electric",
  "Dehumidifier - Construction"
];

// Australian construction site tariffs
const tariffTypes = [
  "Construction Site - Temporary Supply",
  "Industrial - Peak Demand",
  "Industrial - Off-Peak",
  "Business - Standard",
  "Time of Use - Construction",
  "Demand Charge - Construction",
  "Green Power - 25%",
  "Green Power - 50%",
  "Green Power - 100%",
  "Embedded Network"
];

export default function Scope2() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const { calculateScope2Emissions, loading: calculating } = useEmissionCalculations();

  // Use useEffect for navigation to prevent render-time updates
  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  
  const form = useForm<Scope2FormData>({
    resolver: zodResolver(scope2Schema),
    defaultValues: {
      electricity: [{ 
        state_region: "", 
        energy_source: "", 
        quantity: 0, 
        unit: "kWh", 
        green_power_percentage: 0,
        supplier_name: "",
        tariff_type: "",
        notes: "" 
      }],
      heating_cooling: [{ 
        system_type: "", 
        energy_source: "", 
        quantity: 0, 
        unit: "GJ", 
        efficiency_rating: 0,
        operating_hours: 0,
        notes: "" 
      }],
      purchased_steam: [{ 
        steam_source: "", 
        quantity: 0, 
        unit: "GJ", 
        pressure_rating: "",
        supplier_name: "",
        notes: "" 
      }],
    },
  });

  const {
    fields: electricityFields,
    append: appendElectricity,
    remove: removeElectricity,
  } = useFieldArray({
    control: form.control,
    name: "electricity",
  });

  const {
    fields: heatingFields,
    append: appendHeating,
    remove: removeHeating,
  } = useFieldArray({
    control: form.control,
    name: "heating_cooling",
  });

  const {
    fields: steamFields,
    append: appendSteam,
    remove: removeSteam,
  } = useFieldArray({
    control: form.control,
    name: "purchased_steam",
  });

  // Track the selected state from the first electricity entry to determine steam availability
  const selectedState = form.watch("electricity.0.state_region");
  const isSteamAvailable = React.useMemo(() => {
    return selectedState ? STATES_WITH_STEAM.includes(selectedState.toLowerCase()) : false;
  }, [selectedState]);

  // Get state label for display
  const getStateLabel = (stateValue: string) => {
    const state = australianStates.find(s => s.value === stateValue);
    return state ? state.label : stateValue.toUpperCase();
  };

  const onSubmit = async (data: Scope2FormData) => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before calculating emissions.",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one valid entry exists with quantity > 0
    const validElectricity = data.electricity.filter(e => e.quantity > 0 && e.state_region && e.energy_source);
    const validHeating = data.heating_cooling.filter(h => h.quantity > 0 && h.state_region && h.system_type && h.energy_source && h.efficiency_rating > 0 && h.operating_hours > 0);
    const validSteam = data.purchased_steam?.filter(s => s.quantity > 0 && s.state_region && s.steam_source) || [];
    
    const totalValidEntries = validElectricity.length + validHeating.length + validSteam.length;
    
    if (totalValidEntries === 0) {
      toast({
        title: "No Valid Data",
        description: "Please add at least one complete entry with quantity greater than 0 before calculating.",
        variant: "destructive",
      });
      return;
    }

    // Transform form data to match calculation hook format
    const transformedData = {
      electricity: data.electricity.map(elec => ({
        state: elec.state_region.toUpperCase(),
        quantity: elec.quantity,
        unit: elec.unit,
        renewablePercentage: elec.green_power_percentage,
        notes: elec.notes
      })),
      heating: data.heating_cooling.map(heat => ({
        state: heat.state_region.toUpperCase(),
        quantity: heat.quantity,
        unit: heat.unit,
        notes: heat.notes
      })),
      steam: (data.purchased_steam || []).map(steam => ({
        state: steam.state_region.toUpperCase(),
        quantity: steam.quantity,
        unit: steam.unit,
        notes: steam.notes
      }))
    };

    try {
      console.log("=== Scope 2 Calculation Starting ===");
      console.log("Form data:", data);
      console.log("Valid entries:", { validElectricity, validHeating, validSteam });
      console.log("Transformed data:", transformedData);
      
      const result = await calculateScope2Emissions(transformedData);
      
      console.log("=== Calculation Result ===", result);
      
      if (result) {
        if (result.total === 0) {
          toast({
            title: "Calculation Complete",
            description: "Emissions calculated but total is 0 tCO₂e. Please verify your data entries.",
            variant: "default",
          });
        } else {
          toast({
            title: "Emissions Calculated",
            description: `Total Scope 2 emissions: ${result.total.toFixed(2)} tCO₂e`,
          });
        }
      } else {
        toast({
          title: "Calculation Failed",
          description: "No valid emission data was calculated. Please check your entries and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("=== Calculation Error ===", error);
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-scope-2 flex items-center gap-2">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
            Scope 2: Energy Emissions
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1">
            Calculate emissions from purchased electricity, steam, heat and cooling for construction sites
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">
            ISO 14064-1:2018 & Australian NGA Factors Compliant
          </p>
        </div>
        <Badge variant="secondary" className="text-scope-2 border-scope-2/20 w-fit text-xs">
          LCA Methodology
        </Badge>
      </div>

      <ProjectSelector />

      <Card className="bg-gradient-to-r from-scope-2/5 to-scope-2/10 border-scope-2/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-scope-2">
            <Zap className="h-5 w-5" />
            Australian Grid Emission Factors
          </CardTitle>
          <CardDescription>
            Using National Greenhouse Accounts Factors 2024 for state-specific calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">NSW</div>
              <div className="text-scope-2">0.79 tCO₂e/MWh</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">VIC</div>
              <div className="text-scope-2">1.02 tCO₂e/MWh</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">QLD</div>
              <div className="text-scope-2">0.81 tCO₂e/MWh</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">SA</div>
              <div className="text-scope-2">0.42 tCO₂e/MWh</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Steam availability alert */}
          {selectedState && !isSteamAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Purchased steam is not available in {getStateLabel(selectedState)}. District steam systems are primarily limited to major CBD areas in Sydney and Melbourne. This tab has been hidden as it's not applicable to your project location.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="electricity" className="space-y-4">
            <TabsList className={`grid w-full ${isSteamAvailable ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} h-auto gap-1`}>
              <TabsTrigger value="electricity" className="text-xs sm:text-sm px-2 py-2.5">Electricity</TabsTrigger>
              <TabsTrigger value="heating" className="text-xs sm:text-sm px-2 py-2.5">Heating & Cooling</TabsTrigger>
              {isSteamAvailable && (
                <TabsTrigger value="steam" className="text-xs sm:text-sm px-2 py-2.5">
                  Steam
                  <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Limited</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="electricity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Grid Electricity Consumption
                    <InfoTooltip content="Calculate emissions from electricity purchased from the grid. Select typical site consumption amounts or enter your exact usage. Green power percentage reduces calculated emissions." />
                  </CardTitle>
                  <CardDescription>
                    Electricity purchased from the grid with state-specific emission factors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {electricityFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Electricity Source {index + 1}</h4>
                        {electricityFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeElectricity(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`electricity.${index}.state_region`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                State/Region
                                {index === 0 && (
                                  <InfoTooltip content="Your state selection determines available emission sources. Steam heating is only available in NSW, VIC, and ACT where district steam systems exist." />
                                )}
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {australianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
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
                        name={`electricity.${index}.energy_source`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Energy Source</FormLabel>
                            <FormControl>
                              <Combobox
                                options={energySources}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select source"
                                searchPlaceholder="Search energy sources..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`electricity.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Quantity
                                <InfoTooltip content="Select typical construction site electricity consumption (daily or monthly) or enter your exact usage." />
                              </FormLabel>
                              <FormControl>
                                <NumberInputWithPresets
                                  value={field.value}
                                  onChange={field.onChange}
                                  presets={electricityQuantityPresets}
                                  placeholder="Select or enter quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`electricity.${index}.unit`}
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
                                  <SelectItem value="kWh">Kilowatt-hours (kWh)</SelectItem>
                                  <SelectItem value="MWh">Megawatt-hours (MWh)</SelectItem>
                                  <SelectItem value="GWh">Gigawatt-hours (GWh)</SelectItem>
                                  <SelectItem value="GJ">Gigajoules (GJ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`electricity.${index}.green_power_percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Green Power (%)
                                <InfoTooltip content="Enter the percentage of renewable energy in your electricity supply. Select common GreenPower levels or enter exact percentage." />
                              </FormLabel>
                              <FormControl>
                                <NumberInputWithPresets
                                  value={field.value}
                                  onChange={field.onChange}
                                  presets={greenPowerPresets}
                                  placeholder="Select or enter %"
                                  unit="%"
                                  min={0}
                                />
                              </FormControl>
                              <FormDescription>
                                Percentage of renewable energy certificates
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`electricity.${index}.supplier_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supplier</FormLabel>
                              <FormControl>
                                <Input placeholder="Energy supplier" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`electricity.${index}.tariff_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tariff Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tariff" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tariffTypes.map((tariff) => (
                                    <SelectItem key={tariff} value={tariff.toLowerCase().replace(" ", "_")}>
                                      {tariff}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                    onClick={() => appendElectricity({ 
                      state_region: "", 
                      energy_source: "", 
                      quantity: 0, 
                      unit: "kWh", 
                      green_power_percentage: 0,
                      supplier_name: "",
                      tariff_type: "",
                      notes: "" 
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Electricity Source
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heating">
              <Card>
                <CardHeader>
                  <CardTitle>Heating & Cooling Systems</CardTitle>
                  <CardDescription>
                    Purchased heating, cooling, and HVAC system energy consumption
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heatingFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">HVAC System {index + 1}</h4>
                        {heatingFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeHeating(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`heating_cooling.${index}.state_region`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {australianStates.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
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
                        name={`heating_cooling.${index}.system_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={systemTypes}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select system"
                                searchPlaceholder="Search system types..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`heating_cooling.${index}.energy_source`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Energy Source</FormLabel>
                            <FormControl>
                              <Combobox
                                options={energySources}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select source"
                                searchPlaceholder="Search energy sources..."
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
                        name={`heating_cooling.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Energy Consumed
                              <InfoTooltip content="Select typical HVAC energy consumption values or enter your exact usage. Values based on common construction site heating/cooling systems." />
                            </FormLabel>
                            <FormControl>
                              <NumberInputWithPresets
                                value={field.value}
                                onChange={field.onChange}
                                presets={electricityQuantityPresets}
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
                          name={`heating_cooling.${index}.unit`}
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
                                  <SelectItem value="GJ">Gigajoules (GJ)</SelectItem>
                                  <SelectItem value="kWh">Kilowatt-hours (kWh)</SelectItem>
                                  <SelectItem value="MWh">Megawatt-hours (MWh)</SelectItem>
                                  <SelectItem value="therms">Therms</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      <FormField
                        control={form.control}
                        name={`heating_cooling.${index}.efficiency_rating`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Efficiency Rating (COP/EER)
                              <InfoTooltip content="Select typical HVAC efficiency ratings or enter your system's specific rating. Common values for portable AC, split systems, and chillers provided." />
                            </FormLabel>
                            <FormControl>
                              <NumberInputWithPresets
                                value={field.value}
                                onChange={field.onChange}
                                presets={efficiencyRatingPresets}
                                placeholder="Select or enter rating"
                                min={0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`heating_cooling.${index}.operating_hours`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Operating Hours/Year
                              <InfoTooltip content="Select typical construction site operating hours or enter your exact hours. Maximum 8760 hours per year. Common values for day shifts, extended hours, and continuous operation provided." />
                            </FormLabel>
                            <FormControl>
                              <NumberInputWithPresets
                                value={field.value}
                                onChange={field.onChange}
                                presets={operatingHoursPresets}
                                placeholder="Select or enter hours"
                                min={0}
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
                    onClick={() => appendHeating({ 
                      state_region: "",
                      system_type: "", 
                      energy_source: "", 
                      quantity: 0, 
                      unit: "GJ", 
                      efficiency_rating: 0,
                      operating_hours: 0,
                      notes: "" 
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add HVAC System
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="steam">
              <Card>
                <CardHeader>
                  <CardTitle>Purchased Steam</CardTitle>
                  <CardDescription>
                    Steam purchased from external suppliers or district heating systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {steamFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Steam Source {index + 1}</h4>
                        {steamFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSteam(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`purchased_steam.${index}.state_region`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Region</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {australianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
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
                          name={`purchased_steam.${index}.steam_source`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Steam Source</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., District Heating Plant" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      <FormField
                        control={form.control}
                        name={`purchased_steam.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Quantity
                              <InfoTooltip content="Select typical steam consumption quantities or enter your exact usage. Values provided for common construction site steam requirements." />
                            </FormLabel>
                            <FormControl>
                              <NumberInputWithPresets
                                value={field.value}
                                onChange={field.onChange}
                                presets={electricityQuantityPresets}
                                placeholder="Select or enter quantity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                        <FormField
                          control={form.control}
                          name={`purchased_steam.${index}.unit`}
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
                                  <SelectItem value="GJ">Gigajoules (GJ)</SelectItem>
                                  <SelectItem value="MMBtu">Million BTU (MMBtu)</SelectItem>
                                  <SelectItem value="tonnes">Tonnes of Steam</SelectItem>
                                  <SelectItem value="klb">Thousand pounds (klb)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`purchased_steam.${index}.pressure_rating`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pressure Rating</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 150 psi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`purchased_steam.${index}.supplier_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supplier Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Steam supplier" {...field} />
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
                    onClick={() => appendSteam({ 
                      state_region: "",
                      steam_source: "", 
                      quantity: 0, 
                      unit: "GJ", 
                      pressure_rating: "",
                      supplier_name: "",
                      notes: "" 
                    })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Steam Source
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