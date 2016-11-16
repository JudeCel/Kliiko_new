# Deploy setup
* Authenticate in Credentials for Google cloud - Google account from Gmail should work.
* You need to be added to https://hub.docker.com/ , contact team members or admin for this.

* download Google Cloud sdk from https://cloud.google.com/sdk/
* install Google Cloud  components

  ```
  gcloud components install kubectl
  ```

* authenticate

```
gcloud auth login
```

you will be redirected to Login page, authenticate and agree with terms.

* set Google Cloud time zone

```
 gcloud config set compute/zone us-central1-a
 ```

* setup working project name for Google Cloud

```
gcloud config set project sound-temple-130607
```

* get and setup 2 KLZII projects (Kliiko, Klzii_chat) if you haven’t done this already.

# Deploy process.

## Klzii Dashboard.
Go to https://hub.docker.com/r/klzii/kliiko/builds/ and check if last build is Successful. If yes then in Terminal:

* To deploy in test environment for QA

```
 cd YourKliikoPath/

./bin/deploy_latest_test
```

* To deploy in production environment for Client

```
 ./bin/deploy_latest_production
```



## Klzii Chat.
 Go to https://hub.docker.com/r/klzii/klzii_chat/builds/ and check if last build is Successful. If yes then in Terminal:

* to deploy in test environment for QA
```
 cd YourKlziiChatPath/
./bin/deploy_latest_test
```

* to deploy in production environment for Client
```
 cd YourKlziiChatPath/
 ./bin/deploy_latest_production
```


* Check Deploy process:
```
 cd YourProjectPath/

 kubectl get pods
```

this will give you info:
```
NAME                           READY     STATUS    RESTARTS   AGE
admin-2357230094-yzvhw         1/1       Running   0          46s
chat-1704587122-svaf2          1/1       Running   0          1h
postgres-n5oyy                 1/1       Running   0          3h
proxy-admin-7kfeo              1/1       Running   0          6d
proxy-chat-twqj5               1/1       Running   0          3h
redis-master-821379479-br3ta   1/1       Running   0          3h
```

```admin-…..``` is notifying Dashboard deploy progresses status

```chat-…..``` is notifying Chat deploy progresses status

As soon as *needed item* is marked *Ready* it can be accesed in browser

# Calling Remote procedures

Once application was deployed you can execute operations:
```
kubectl exec admin-2357230094-7u343 npm run updateBaseMailTemplates
```

In this example ```admin-2357230094-7u343 ``` is the name of application instance. You can get the list of instances and status with:
```
cd YourProjectPath/
kubectl get pods

```
To watch logs of proxy instance, get a string of proxy provided by *kubectl get pods*

```
kubectl logs -f proxyName
```

The list of available commands can be seen in project root folder ```package.json``` scripts section.
Before executing any of these please consult your colleagues and be careful.
