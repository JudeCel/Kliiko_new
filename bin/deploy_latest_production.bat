echo "Deploying latest production klzii_admin image from docker hub"
call gcloud container clusters get-credentials klzii-production
call kubectl delete deployment admin
call kubectl apply -f ../deploy/staging/admin.yml
call kubectl get pods
