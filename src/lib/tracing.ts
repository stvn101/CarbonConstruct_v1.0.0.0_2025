import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";

export function initTracing() {
  try {
    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: "loval-carbon-compass",
    });

    const provider = new WebTracerProvider({
      resource,
    });

    // Use the AI Toolkit's OTLP endpoint
    const exporter = new OTLPTraceExporter({
      url: "http://localhost:4318/v1/traces",
    });

    provider.addSpanProcessor(new BatchSpanProcessor(exporter));

    provider.register();

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const propagateTraceHeaderCorsUrls = [];

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
