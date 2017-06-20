IMAGE_NAME = astronomerio/ingestion-tracking-worker
VERSION = 1.4.2

.PHONY: build build-version push push-version

build:
	docker build -t $(IMAGE_NAME) .

build-version:
	docker build -t $(IMAGE_NAME):$(VERSION) .

push:
	docker push $(IMAGE_NAME)

push-version:
	docker push $(IMAGE_NAME):$(VERSION)

run:
	docker run -it -p 5000:5000/udp --env-file=./.env $(IMAGE_NAME)