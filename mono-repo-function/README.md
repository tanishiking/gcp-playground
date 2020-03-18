This project is a minimal reproduciable example for deploy failure because of `Your lockfile needs to be updated, but yarn was run with --frozen-lockfile` error even though yarn.lock is the latest one.

```
Deploying function (may take a while - up to 2 minutes)...failed.
ERROR: (gcloud.functions.deploy) OperationError: code=3, message=Build failed: {"error":{"errorType":2,"canonicalCode":2,"errorId":"10412c2f","errorMessage":"error Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`."}}
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```


```sh
$ node -v
v10.14.2

$ yarn -v
1.22.4

$ gcloud --version
Google Cloud SDK 284.0.0
app-engine-go
app-engine-python 1.9.88
beta 2019.05.17
bq 2.0.54
cloud-build-local
cloud-datastore-emulator 2.1.0
core 2020.03.06
docker-credential-gcr
gcloud
gsutil 4.48
pubsub-emulator 2019.09.27
```
