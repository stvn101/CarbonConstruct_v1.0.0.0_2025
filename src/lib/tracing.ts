// Tracing is only initialized in local development with OTLP collector running
export function initTracing() {
  // Skip tracing in production or when not on localhost
  if (typeof window === 'undefined') return;
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // Only initialize tracing in local development
  if (!isLocalhost) {
    return;
  }

  // Dynamic import to avoid loading tracing libraries in production
  import('@opentelemetry/sdk-trace-web').then(async ({ WebTracerProvider }) => {
    try {
      const { SimpleSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
      const { resourceFromAttributes } = await import('@opentelemetry/resources');
      const { SEMRESATTRS_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');
      const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
      const { DocumentLoadInstrumentation } = await import('@opentelemetry/instrumentation-document-load');
      const { FetchInstrumentation } = await import('@opentelemetry/instrumentation-fetch');

      const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: "carbonconstruct-local",
      });

      const exporter = new OTLPTraceExporter({
        url: "http://localhost:4318/v1/traces",
      });

      const provider = new WebTracerProvider({
        resource,
        spanProcessors: [new SimpleSpanProcessor(exporter)],
      });

      provider.register();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const propagateTraceHeaderCorsUrls: RegExp[] = [];

      if (supabaseUrl) {
        propagateTraceHeaderCorsUrls.push(
          new RegExp(supabaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        );
      }

      registerInstrumentations({
        instrumentations: [
          new DocumentLoadInstrumentation(),
          new FetchInstrumentation({
            propagateTraceHeaderCorsUrls,
          }),
        ],
      });

      console.log("Tracing initialized (local development only)");
    } catch (error) {
      // Silently fail - tracing is optional
      console.debug("Tracing setup skipped:", error);
    }
  }).catch(() => {
    // Silently fail if modules can't be loaded
  });
}
