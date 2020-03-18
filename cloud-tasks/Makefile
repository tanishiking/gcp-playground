PROJECT := tanishiking-dev
GCLOUD := gcloud --project=$(PROJECT)
REGION := asia-northeast1

HANDLER_NAME := handler
HANDLER_URL := https://$(REGION)-$(PROJECT).cloudfunctions.net/$(HANDLER_NAME)
FUNCTION_NAME := enqueuer
QUEUE_NAME := test

IAM_NAME := http-task-invoker
IAM_EMAIL:= $(IAM_NAME)@$(PROJECT).iam.gserviceaccount.com

TOPIC := enqueuer

.PHONY: create-queue
create-queue:
	$(GCLOUD) tasks queues create $(QUEUE_NAME)

.PHONY: describe-queue
describe-queue:
	$(GCLOUD) tasks queues describe $(QUEUE_NAME)

.PHONY: build
build:
	npm run build

.PHONY: deploy-function
deploy-function: build
	$(GCLOUD) functions deploy $(HANDLER_NAME) \
		--runtime=nodejs10 \
		--trigger-http \
		--region=$(REGION)

.PHONY: set-access-control
set-access-control:
	$(GCLOUD) functions add-iam-policy-binding $(FUNCTION_NAME) \
		--region=$(REGION) \
		--member=allAuthenticatedUsers \
		--role=roles/cloudfunctions.invoker

.PHONY: deploy-enqueuer
deploy-enqueuer: build
	$(GCLOUD) functions deploy $(FUNCTION_NAME) \
		--runtime=nodejs10 \
		--trigger-topic=$(TOPIC) \
		--region=$(REGION) \
		--set-env-vars PROJECT=$(PROJECT),LOCATION=$(REGION),QUEUE=$(QUEUE_NAME),URL=$(HANDLER_URL),EMAIL=$(IAM_EMAIL)

.PHONY: create-iam
create-iam:
	$(GCLOUD) iam service-accounts create $(IAM_NAME)

# https://cloud.google.com/iam/docs/understanding-roles?hl=ja#predefined_roles
.PHONY: prepare-iam
prepare-iam:
	$(GCLOUD) projects add-iam-policy-binding $(PROJECT) \
		--member=serviceAccount:$(IAM_EMAIL) \
		--role=roles/cloudfunctions.invoker