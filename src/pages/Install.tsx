import { useState, useEffect } from 'react';
import { Smartphone, Download, Share, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logoImageWebp from '@/assets/carbonconstruct-logo.webp';
import logoImagePng from '@/assets/carbonconstruct-logo.png';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 p-4 shadow-lg">
            <picture>
              <source srcSet={logoImageWebp} type="image/webp" />
              <img src={logoImagePng} alt="CarbonConstruct" className="w-full h-full object-contain" />
            </picture>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">Install CarbonConstruct</h1>
        <p className="text-xl text-muted-foreground">
          Get quick access to carbon calculations right from your home screen
        </p>
      </div>

      {isInstalled ? (
        /* Already Installed */
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">App Installed Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              CarbonConstruct is now on your home screen. You can access it anytime, even offline.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Install Button */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Smartphone className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Install for Quick Access</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Add CarbonConstruct to your home screen for instant access to carbon calculations, 
                  offline support, and a native app experience.
                </p>
                <Button size="lg" onClick={handleInstallClick} className="min-w-[200px]">
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Why Install?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Works Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your calculations even without internet connection
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Faster Loading</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant access with optimized performance
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">App-Like Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Full-screen mode without browser controls
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Installation Instructions */}
          {showInstructions && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Share className="h-5 w-5" />
                      iPhone / Safari
                    </CardTitle>
                    <Badge>iOS</Badge>
                  </div>
                  <CardDescription>Install on iPhone or iPad</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">1.</span>
                      <span>Tap the <strong>Share button</strong> <Share className="inline h-4 w-4" /> at the bottom of Safari</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">2.</span>
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">3.</span>
                      <span>Tap <strong>"Add"</strong> in the top right corner</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MoreVertical className="h-5 w-5" />
                      Android / Chrome
                    </CardTitle>
                    <Badge variant="secondary">Android</Badge>
                  </div>
                  <CardDescription>Install on Android devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">1.</span>
                      <span>Tap the <strong>menu button</strong> <MoreVertical className="inline h-4 w-4" /> (three dots) in Chrome</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">2.</span>
                      <span>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[20px]">3.</span>
                      <span>Tap <strong>"Install"</strong> or <strong>"Add"</strong> to confirm</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Install;
