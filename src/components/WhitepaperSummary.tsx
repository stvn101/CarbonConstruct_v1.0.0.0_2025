import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WhitepaperSummaryProps {
  compact?: boolean;
  className?: string;
}

export const WhitepaperSummary = ({ compact = false, className = "" }: WhitepaperSummaryProps) => {
  const keyPoints = [
    {
      icon: AlertTriangle,
      stat: "80-90%",
      label: "of builder's carbon footprint is Scope 3 (supply chain)"
    },
    {
      icon: TrendingUp,
      stat: "$123/t",
      label: "shadow carbon price in NSW & VIC procurement"
    },
    {
      icon: Shield,
      stat: "20-30%",
      label: "penalty inflation for missing EPD data"
    }
  ];

  if (compact) {
    return (
      <Card className={`border-l-4 border-l-primary ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 text-xs">Research Insight</Badge>
              <h3 className="font-semibold text-foreground mb-2">
                The Silent Transfer: Why Your EPD Data Now Decides Tender Success
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                ASRS Scope 3 mandates are creating a "procurement firewall"—subcontractors 
                without EPDs face exclusion regardless of price.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/resources">
                    Read Full Analysis
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="/resources/the-silent-transfer-whitepaper.pdf" download>
                    <Download className="w-3 h-3 mr-1" />
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`py-12 md:py-16 ${className}`}
    >
      <div className="container mx-auto px-4">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Left Content */}
            <div className="lg:col-span-3 p-6 md:p-8">
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
                Featured Research
              </Badge>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl md:text-2xl">
                  The Silent Transfer
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  How Scope 3 mandates are shifting carbon liability to the construction supply chain
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-6">
                  A 14-page analysis of why subcontractors who can't provide EPD data face tender 
                  exclusion—even when competitive on price. Covers ASRS requirements, Green Star 
                  data penalties, shadow carbon pricing, and contractual enforcement mechanisms.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {keyPoints.map((point, index) => (
                    <div key={index} className="text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <point.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-bold text-foreground">{point.stat}</p>
                      <p className="text-xs text-muted-foreground">{point.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/resources">
                      Read Full Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/resources/the-silent-transfer-whitepaper.pdf" download>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </div>

            {/* Right Highlight */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 flex flex-col justify-center">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-3">
                  The Bottom Line:
                </p>
                <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary pl-4">
                  "The legislation doesn't name subcontractors because it doesn't need to. 
                  The burden flows through procurement—creating a 'firewall' as formidable 
                  as financial insolvency or safety non-compliance."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-3">
                  — Steven Jenkins, Director United Facade Pty Ltd
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.section>
  );
};

export default WhitepaperSummary;
