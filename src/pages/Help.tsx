import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, BookOpen, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Help & Resources</h1>
            <p className="text-muted-foreground">Find answers and learn how to use CarbonCalc Pro effectively</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>Learn the basics of carbon emission calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>CarbonCalc Pro helps you measure and track greenhouse gas emissions across three scopes:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Scope 1:</strong> Direct emissions from owned or controlled sources</li>
                  <li><strong>Scope 2:</strong> Indirect emissions from purchased energy</li>
                  <li><strong>Scope 3:</strong> All other indirect emissions in your value chain</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I create a new project?</AccordionTrigger>
                  <AccordionContent>
                    You can create a new project from the dashboard by clicking the "New Project" button and filling out the project details including name, type, and location.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>What emission factors are used in calculations?</AccordionTrigger>
                  <AccordionContent>
                    CarbonCalc Pro uses internationally recognized emission factors from sources like IPCC, EPA, and regional standards. These are regularly updated to ensure accuracy.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I export my emissions report?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Reports section and use the export functionality to generate PDF reports with your emissions data and analysis.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I import data from spreadsheets?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can import emissions data from CSV files in each scope section. Make sure your data follows the required format template.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
              <CardDescription>Get additional support and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Documentation
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                For technical support or questions about emission calculations, please reach out to our team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;