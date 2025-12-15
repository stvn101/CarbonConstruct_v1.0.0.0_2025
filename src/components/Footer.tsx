import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Facebook, Instagram } from "lucide-react";
const logoImage32 = "/logo-32.webp";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" role="contentinfo" className="bg-muted/30 border-t border-border mt-auto pb-[env(safe-area-inset-bottom)]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoImage32} alt="CarbonConstruct Logo" className="h-8 w-8" width="32" height="32" />
              <span className="font-bold text-lg text-foreground">CarbonConstruct</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional carbon emissions calculator for Australian construction projects. 
              NCC compliant with Green Star and NABERS integration.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.linkedin.com/in/steven-j-carbonconstruct" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow CarbonConstruct on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1AdCKCCb4f/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow CarbonConstruct on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/carbonconstruct_tech?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow CarbonConstruct on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links" className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-muted-foreground hover:text-primary transition-colors">
                  LCA Calculator
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-muted-foreground hover:text-primary transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/install" className="text-muted-foreground hover:text-primary transition-colors">
                  Install App
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help & Resources
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources" className="space-y-4">
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
                <Link to="/materials/status" className="text-muted-foreground hover:text-primary transition-colors">
                  Materials Database
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Impact
                </Link>
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
          </nav>

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
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Brisbane, QLD, Australia</span>
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
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
              <a 
                href="https://rattle-houseboat-ff1.notion.site/Ethical-Sourcing-Declaration-2424caf9a8c1800e9555d56f1a1e915e?pvs=143" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors"
              >
                Modern Slavery Statement
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
