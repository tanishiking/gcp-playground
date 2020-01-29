import * as tracer from "@google-cloud/trace-agent";

const projectId = process.env.GCP_PROJECT;
let traceApi: tracer.PluginTypes.Tracer | undefined;
if (process.env.NODE_ENV === "production") {
  // const credentials = require('./credentials/trace-agent-key.json')
  // console.log(credentials)
  traceApi = tracer.start({
    projectId,
    // credentials,
    // logLevel: 4, // debug
    // bufferSize: 10
    keyFilename: "./credentials/trace-agent-key.json"
  });
}

import { PubsubMessage } from "@google-cloud/pubsub/build/src/publisher";
import { Context } from "@google-cloud/functions-framework";
import { LoggingWinston } from "@google-cloud/logging-winston";

import * as winston from "winston";
import * as Transport from "winston-transport";

const loggingWinston = new LoggingWinston()

function createLogger(): winston.Logger {
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

const defaultLogger = createLogger();

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

  if (context.eventId) {
    defaultLogger.configure({
      transports: new LoggingWinston({
        labels: {
          execution_id: context.eventId,
        },
      })
    });
  }

  const logger = defaultLogger.child({
    trace
  });

  logger.info("message-function", { messageData: message });

  logger.info("start-function", { context });

  logger.warn("test-warn", { text: "test" });

  const sleep100 = await runWithChildSpan(
    async span => {
      const res = await sleep(100, logger);
      span?.endSpan();
      return res;
    },
    { name: "sleep100" },
    rootSpan
  );

  const sleep150 = await runWithChildSpan(
    async span => {
      const res = await sleep(150, logger);
      span?.endSpan();
      return res;
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
const sleep = (duration: number, logger?: winston.Logger): Promise<number> => {
  const log = logger ? logger : defaultLogger;
  return new Promise(resolve => {
    setTimeout(() => {
      log.info(`finished-sleep-${duration}`);
      resolve(duration);
    }, duration);
  });
};
