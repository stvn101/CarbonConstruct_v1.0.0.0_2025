import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";

export function initTracing() {
  // Only initialize tracing in local development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return; // Skip tracing in production
    }
  }

  try {
    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: "loval-carbon-compass",
    });

    // Use the AI Toolkit's OTLP endpoint
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
          // Propagate trace headers to Supabase backend
          propagateTraceHeaderCorsUrls,
        }),
      ],
    });

    console.log("Tracing initialized");
  } catch (error) {
    console.error("Failed to initialize tracing:", error);
  }
}