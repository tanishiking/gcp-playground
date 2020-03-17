import { PubsubMessage } from "@google-cloud/pubsub/build/src/publisher";
import { Context } from "@google-cloud/functions-framework";
import { LoggingWinston } from "@google-cloud/logging-winston";

import * as winston from "winston";
import * as Transport from "winston-transport";
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub({ projectId: "tanishiking-dev" })

const logger = createLogger();
export async function pubsubTest(
  message: PubsubMessage,
  context: Context
): Promise<void> {
  const x = [1, 2, 3, 4, 5]
  logger.info('test', {
      test: "test",
      x,
  })

}

const loggingWinston = new LoggingWinston();
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
