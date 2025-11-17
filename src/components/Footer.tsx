import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from "lucide-react";
import logoImage from "@/assets/carbonconstruct-logo.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="CarbonConstruct Logo" className="h-8 w-8" />
              <span className="font-bold text-lg text-foreground">CarbonConstruct</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional carbon emissions calculator for Australian construction projects. 
              NCC compliant with Green Star and NABERS integration.
            </p>
            <div className="flex gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/lca" className="text-muted-foreground hover:text-primary transition-colors">
                  LCA Calculator
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-muted-foreground hover:text-primary transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help & Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://ncc.abcb.gov.au/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  NCC Guidelines
                </a>
              </li>
              <li>
                <a href="https://www.gbca.org.au/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  Green Star Rating
                </a>
              </li>
              <li>
                <a href="https://www.nabers.gov.au/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  NABERS Energy
                </a>
              </li>
              <li>
                <a href="https://climate.stripe.com/qDm9Cw" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  Stripe Climate
                </a>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@carbonconstruct.com.au" className="hover:text-primary transition-colors">
                  info@carbonconstruct.com.au
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>1300 CARBON (227 266)</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Sydney, NSW, Australia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {currentYear} CarbonConstruct. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/help" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/help" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/help" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
