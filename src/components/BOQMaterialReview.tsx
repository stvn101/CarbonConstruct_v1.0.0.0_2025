import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface Material {
  material_name: string;
  quantity: number;
  unit: string;
  category: string;
  matched_epd_id?: string;
  confidence?: number;
  ef_total?: number;
}

interface BOQMaterialReviewProps {
  materials: Material[];
  onConfirm: (selectedMaterials: Material[]) => void;
  onBack: () => void;
}

export function BOQMaterialReview({ materials, onConfirm, onBack }: BOQMaterialReviewProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Set<number>>(
    new Set(materials.map((_, index) => index))
  );

  const toggleMaterial = (index: number) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedMaterials(newSelected);
  };

  const toggleAll = () => {
    if (selectedMaterials.size === materials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(materials.map((_, index) => index)));
    }
  };

  const handleConfirm = () => {
    const selected = materials.filter((_, index) => selectedMaterials.has(index));
    onConfirm(selected);
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;

    if (confidence >= 0.9) {
      return <Badge className="bg-green-500 hover:bg-green-600">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
    } else {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Low</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Review Imported Materials
        </CardTitle>
        <CardDescription>
          Review and select materials to import into the calculator.
          {materials.length} materials found in your BOQ file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMaterials.size === materials.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all materials"
                  />
                </TableHead>
                <TableHead>Material Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Match Quality</TableHead>
                <TableHead className="text-right">EF Total (kgCO2e)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No materials found
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMaterials.has(index)}
                        onCheckedChange={() => toggleMaterial(index)}
                        aria-label={`Select ${material.material_name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{material.material_name}</TableCell>
                    <TableCell className="text-right">{material.quantity.toLocaleString()}</TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.category}</Badge>
                    </TableCell>
                    <TableCell>{getConfidenceBadge(material.confidence)}</TableCell>
                    <TableCell className="text-right">
                      {material.ef_total ? material.ef_total.toFixed(2) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back to Upload
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {selectedMaterials.size} of {materials.length} materials selected
            </p>
            <Button
              onClick={handleConfirm}
              disabled={selectedMaterials.size === 0}
              className="gap-2"
            >
              Import Selected Materials
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
