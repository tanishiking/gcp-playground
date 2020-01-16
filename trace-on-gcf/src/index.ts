import * as tracer from "@google-cloud/trace-agent";

const projectId = process.env.GCP_PROJECT;
let traceApi: tracer.PluginTypes.Tracer | undefined;
if (process.env.NODE_ENV === "production") {
  traceApi = tracer.start({
    projectId,
    // logLevel: 4, // debug
    // bufferSize: 10
  });
}

import { PubsubMessage } from "@google-cloud/pubsub/build/src/publisher";
import { Context } from "@google-cloud/functions-framework";
import { LoggingWinston } from "@google-cloud/logging-winston";

import * as winston from "winston";
import * as Transport from "winston-transport";

function createLogger(): winston.Logger {
  const loggingWinston = new LoggingWinston();
  const transports: Transport[] = [
    process.env.NODE_ENV === "production"
      ? loggingWinston
      : new winston.transports.Console()
  ];
  return winston.createLogger({
    level: "info",
    transports
  });
}

const logger = createLogger();

export async function traceOnGcf(
  message: PubsubMessage,
  context: Context
): Promise<void> {
  if (traceApi) {
    traceApi.runInRootSpan({ name: "trace-on-gcf-root" }, async rootSpan => {
      await run(message, context, rootSpan);
    });
  } else {
    await run(message, context);
  }
  return;
}

async function run(
  message: PubsubMessage,
  context: Context,
  rootSpan?: tracer.PluginTypes.RootSpan
): Promise<void> {
  const traceId = rootSpan?.getTraceContext()?.traceId;
  const trace =
    typeof traceId !== "undefined"
      ? `projects/${projectId}/traces/${traceId}`
      : undefined;

  logger.info("message-function", { trace, messageData: message });

  logger.info("start-function", { trace, context });

  logger.warn("test-warn", { trace, text: "test" });

  const sleep100 = await runWithChildSpan(
    async span => {
      const res = await sleep(100);
      span?.endSpan()
      return res
    },
    { name: "sleep100" },
    rootSpan
  );

  const sleep150 = await runWithChildSpan(
    async span => {
      const res = await sleep(150);
      span?.endSpan()
      return res
    },
    { name: "sleep150" },
    rootSpan
  );

  if (rootSpan) rootSpan.endSpan();
}

function runWithChildSpan<T>(
  callback: (span?: tracer.PluginTypes.Span) => T,
  spanOptions: tracer.PluginTypes.SpanOptions,
  rootSpan?: tracer.PluginTypes.RootSpan
): T {
  if (rootSpan) {
    const childSpan = rootSpan.createChildSpan(spanOptions);
    return callback(childSpan);
  } else {
    return callback();
  }
}

/**
 *
 * @param duration sleep time (milliseconds)
 * @param trace traceId that is passed to stackdriver logging.
 */
const sleep = (duration: number, trace?: string): Promise<number> => {
  return new Promise(resolve => {
    setTimeout(() => {
      logger.info(`finished-sleep-${duration}`, { trace });
      resolve(duration);
    }, duration);
  });
};
