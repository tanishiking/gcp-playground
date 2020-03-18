## Playground for [Google Cloud Tasks](https://cloud.google.com/tasks)

https://cloud.google.com/tasks/docs/tutorial-gcf

- Create a queue
  - `make create-queue`
- (Optional) Update the queue configuration
  - `gcloud beta tasks queues update test --max-dispatches-per-second=1`
  - Check the current queue configuration
    - `make describe-queue`
- Deploy handler http function and set access control for the function to only allow authenticated users.
  - `make deploy-function`
    - `Allow unauthenticated invocations of new function [enqueuer]? (y/N)?  n`
  - `make set-access-control`
- Create a service account that invoke a handler function from Cloud Tasks, and add cloud functions invoker role.
  - `make create-iam`
  - `make prepare-iam`
- Deploy a function that enqueue a job
  - `make deploy-enqueuer`
- Test
  - Go https://console.cloud.google.com/functions/details/asia-northeast1/handler and click `TEST THE FUNCTION` in `TESTING` tab.
  - Check https://console.cloud.google.com/cloudtasks/queue/test