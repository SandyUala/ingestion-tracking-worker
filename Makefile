IMAGE_NAME = astronomerio/ingestion-tracking-worker
PACKAGE_VERSION=$(shell node -p "require('./package.json').version")

.PHONY: build build-version push push-version

build:
	docker build -t $(IMAGE_NAME) .

build-version:
	docker build -t $(IMAGE_NAME):$(PACKAGE_VERSION) .

push:
	docker push $(IMAGE_NAME)

push-version:
	docker push $(IMAGE_NAME):$(PACKAGE_VERSION)

run:
	docker run -it -p 5000:5000/udp --env-file=./.env $(IMAGE_NAME)