# Reactive Programming

If you've been following recent software development trends, you probably heard of Reactive Programming. It is really a way to bring higher performance with lower memory requirement of Java applications for building API or web services. Reactive Programming can do this by avoiding operating system blocking calls that always lead to process and context switches.

In today tutorial I want to discuss and make a comparison of two Java Reactive frameworks I've been using for developing microservices and high performance platform: [Vertx]([https://vertx.io](https://vertx.io/)) and [SpringBoot](https://spring.io/projects/spring-boot)

Not a formal definition but according to [wikipedia](https://en.wikipedia.org/wiki/Reactive_programming):

> **Reactive programming** is a [programming paradigm](https://en.wikipedia.org/wiki/Programming_paradigm) oriented around [data flows](https://en.wikipedia.org/wiki/Dataflow_programming) and the propagation of change. This means that it should be possible to express static or dynamic data flows with ease in the programming languages used, and that the underlying execution model will automatically propagate changes through the data flow

If don't know Reactive programming yet, here are couple of good links get yourself familiar with:

[The Reactive Manifesto](https://www.reactivemanifesto.org/)

[The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)

[RxJava](https://github.com/ReactiveX/RxJava)

# Example structure

For this performance testing I created two identical REST API for managing a book store including the following operations:

* Clean up the data store
* Add a new book
* Get all book items

The tech-stack includes:

* Vertx Web or SpringBoot for backend
* MongoDB (instance created using Docker) for data layer.

# Performance Test design
In order to test the performance of the above two projects, I used [jMeter](https://jmeter.apache.org/) to design and run the test as following:
## Computer specs
* Computer: Dell `XPS 9560`, `core-i7-7700HQ` 4 cores 8 threads, 16GB RAM
* Mongodb: Run inside docker
* Java application: Run from terminal by `mvn`

## jMeter test specs
* `ThreadGroup.num_threads` (concurrent users): 65000 (since I use a Windows machine, this is the maximum number of threads I can run).
If you have problem running the test on Windows with a large number of threads please create the following registry entry:  
  - Location: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters`
  - Value Name: MaxUserPort
  - Value Type: DWORD
  - Value data: 65534
  - Valid Range: 5000-65534 (decimal)
  - Default: 0x1388 (5000 decimal)

For more details, please consider following this link: [https://www.baselogic.com/2011/11/23/solved-java-net-bindexception-address-use-connect-issue-windows/](https://www.baselogic.com/2011/11/23/solved-java-net-bindexception-address-use-connect-issue-windows/)
* `ThreadGroup.ramp_time` (time it should take to ramp up to 65000 threads): 120 (2 minutes)
* APDEX satisfaction threshol (in ms)
`jmeter.reportgenerator.apdex_satisfied_threshold=100`
* APDEX tolerance threshold (in ms)
`jmeter.reportgenerator.apdex_tolerated_threshold=500`

* Test steps:

  Step | API call | HTTP Method | Number of calls
  -|-|-|-
  1 | /cleanup/ | GET | 1
  2 | /books/ | POST | 1
  3 | /books/ | GET | 65,000

Details of the test script please see [stress_test.jmx](stress_test.jmx)

# How to run the test
### Step 0. Clone repo
Please clone the current repo, have [Java](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) (at least Java 8), [jMeter](https://jmeter.apache.org/) and [Maven](https://maven.apache.org/) already installed on your system
### Step 1. Start mongodb
It depends on your taste to start a mongodb instance your own way, for the simplicity purpose of this tutorial I'm gonna start up one instance using docker

```bash
docker pull mongo
docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
```
To run already created docker image
```bash
docker run -p 27017-27019:27017-27019 mongo
```

### Step 2. Start Vert.x
```bash
cd reactive-vertx
mvn clean compile exec:java
```

### Step 3. Run the jmeter test for Vert.x
```bash
jmeter -q user.properties -n -t stress_test.jmx -l ./result/vertx/result.csv -e -o ./result/vertx
```

### Step 4. Start Spring-boot
Since both projects are identical, which are using the same port 8080 on localhost, before starting spring-boot please don't forget to terminate Vert.x instance

```bash
cd reactive-springboot
mvn
```
### Step 5. Run the jmeter test for Spring-boot
```bash
jmeter -q user.properties -n -t stress_test.jmx -l ./result/spring/result.csv -e -o ./result/spring
```

# Analyse Test Results and Conclusion
After running the test on my laptop, I found that Spring-boot actually performed much better than Vert.x in term of speed and stability.
![Vert.x summary](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/vertx_summary.jpg)
![Spring-boot summary](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/springboot_summary.jpg)


I also created a [Symfony](https://symfony.com/) 4 microservices project to run with Apache 2 httpd server
