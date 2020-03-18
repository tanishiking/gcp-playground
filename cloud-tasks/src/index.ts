import { Logging } from "@google-cloud/logging";
import { Request, Response } from "express";

import { v2 } from '@google-cloud/tasks'
import * as protosTypes from '@google-cloud/tasks/build/protos/protos'

const logging = new Logging({ projectId: "tanishiking-dev" });

// Creating HTTP Target
// https://cloud.google.com/tasks/docs/tutorial-gcf
// https://cloud.google.com/tasks/docs/creating-http-target-tasks
export async function handler(req: Request, res: Response): Promise<void> {
  const log = logging.log("target");
  const msg = {
    headers: req.headers,
    body: req.body
  };
  const entry = log.entry(msg);
  await log.write(entry);

  if (Math.random() > 0.5) {
    res.send('ok')
  } else {
    throw new Error ('test')
  }
}


export async function enqueuer(message: any, context: any): Promise<void> {
  const project = process.env.PROJECT || ""
  const location = process.env.LOCATION || ""
  const queue = process.env.QUEUE || ""
  const targetUrl = process.env.URL || ""
  const email = process.env.EMAIL || ""

  const client = new v2.CloudTasksClient()
  const log = logging.log("enqueuer");
  const msg = {
    project,
    location,
    queue,
    targetUrl,
  };
  const entry = log.entry(msg);
  await log.write(entry);

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const body = Buffer.from(
    JSON.stringify({
      test: [1,2,3,4,5]
    })
  ).toString('base64')

  const task: protosTypes.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: 'POST',
      url: targetUrl,
      oidcToken: {
        serviceAccountEmail: email,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
    scheduleTime: {
      // random in 30 min
      seconds: Date.now() / 1000 + Math.floor(60 * 30 * Math.random())
    }
  }

  // // Schedule time can not be in the past.
  // if (convertedDate < currentDate) {
  //   console.error('Scheduled date in the past.');
  // } else if (convertedDate > currentDate) {
  //   const date_diff_in_seconds = (convertedDate - currentDate) / 1000;
  //   // Restrict schedule time to the 30 day maximum.
  //   if (date_diff_in_seconds > MAX_SCHEDULE_LIMIT) {
  //     console.error('Schedule time is over 30 day maximum.');
  //   }
  //   // Construct future date in Unix time.
  //   const date_in_seconds =
  //     Math.min(date_diff_in_seconds, MAX_SCHEDULE_LIMIT) + Date.now() / 1000;
  //   // Add schedule time to request in Unix time using Timestamp structure.
  //   // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
  //   task.scheduleTime = {
  //     seconds: date_in_seconds,
  //   };
  // }

  try {
    // Send create task request.
    const [response] = await client.createTask({parent, task});
    console.log(`Created task ${response.name}`);
    return
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.error(Error(error.message));
  }


}