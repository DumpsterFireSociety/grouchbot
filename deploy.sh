#!/bin/sh
kubectl config use-context unplgtc && \
docker-compose -f docker-compose-prod.yaml build && \
docker push guyot/grouchbot:latest && \
#kubectl apply -f grouchbot-service.yaml && \
kubectl rollout restart deployment/grouchbot && \
kubectl rollout status deployment/grouchbot && \
kubectl logs -f -l app=grouchbot --max-log-requests=6
