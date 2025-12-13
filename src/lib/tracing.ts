// Tracing is only enabled in local development
// Early exit for production to prevent any module loading issues
export function initTracing() {
  // Skip tracing entirely in production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return;
    }
  }

  // Use dynamic imports to prevent module loading issues in production
  initTracingAsync().catch(() => {
    // Silently fail - tracing is optional
  });
}

async function initTracingAsync() {
  try {
    const [
      { WebTracerProvider },
      { SimpleSpanProcessor },
      { OTLPTraceExporter },
      { resourceFromAttributes },
      { SEMRESATTRS_SERVICE_NAME },
      { registerInstrumentations },
      { DocumentLoadInstrumentation },
      { FetchInstrumentation },
    ] = await Promise.all([
      import("@opentelemetry/sdk-trace-web"),
      import("@opentelemetry/sdk-trace-base"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/semantic-conventions"),
      import("@opentelemetry/instrumentation"),
      import("@opentelemetry/instrumentation-document-load"),
      import("@opentelemetry/instrumentation-fetch"),
    ]);

    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: "carbonconstruct",
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

    console.log("Tracing initialized (dev only)");
  } catch (error) {
    // Silently fail - tracing is optional and only for dev
    console.warn("Tracing initialization skipped:", error);
  }
}