# Reactive Programming

If you came here, you probably heard of Reactive as a trend of software development in recent years. I believe it is remarkably a way to bring higher performance with the lower memory requirement of Java applications for building API or web services. And the reason Reactive Programming can do this is by avoiding operating system blocking calls that always lead to process and context switches.

Despite working with these tools for some years already, I sometimes found it's difficult to fully understand the difference in performance and not the ecosystem.
That is why in today tutorial I want to discuss and make a comparison of two Java Reactive frameworks I've been using for developing microservices and high-performance platform: [Vertx](https://vertx.io) and [SpringBoot](https://spring.io/projects/spring-boot)

# Example structure

For this performance testing I created two identical REST API for managing a book store including the following operations:

* Clean up the datastore
* Add a new book
* Get all book items

The tech-stack includes:

* Vertx Web or SpringBoot for backend
* MongoDB (instance created using Docker) for the data layer.

# Performance Test design
To test the performance of the above two projects, I used [jMeter](https://jmeter.apache.org/) to design and run the test as following:
## Computer specs
* Computer: Dell `XPS 9560`, `core-i7-7700HQ` 4 cores 8 threads, 16GB RAM
* MongoDB: Run inside docker
* Java application: Run from the terminal by `mvn`

## jMeter test specs
* Parameters:

Since I use windows, the number of thread on a single host I can create with jMeter is limited to around 65000 (see [Some issues](#some-issues)) and yet I still need to create enough loops for each request to reach the max concurrency, I did a simple math `60000 = 2000 * 30` to decide the following parameters

Param | Value | Description
-|-|-
`ThreadGroup.num_threads` | 2000 | 2000 concurrent users
`ThreadGroup.ramp_time` | 20 | 20 seconds
`LoopController.loops` | 30 | Create enough loops request to ramp up 2000 users
`jmeter.reportgenerator.apdex_satisfied_threshold` | 500 | APDEX satisfaction threshol (in ms)
`jmeter.reportgenerator.apdex_tolerated_threshold` | 1500 | APDEX tolerance threshold (in ms)

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
### Step 1. Start MongoDB
It depends on your taste to start a MongoDB instance your own way, for the simple purpose of this tutorial I'm gonna start up one instance using docker

```bash
docker pull mongo
docker run -d -p 27017-27019:27017-27019 --name MongoDB mongo
```
To run already created a docker image
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
After running the test on my laptop, I found that both Spring-boot and Vert.x can handle 60000 requests from 2000 concurrent users nicely in a time frame around 60 seconds.

* Spring-boot performance summary
![Spring-boot summary](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/springboot-performance-summary.jpg)

* Vert.x performance summary
![Vert.x summary](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/vertx-performance-summary.jpg)


* However, the result surprisingly shows that Spring-boot performed much better than Vert.x in term of speed and stability. As defined in `user.properties` the for the request acceptance:
`jmeter.reportgenerator.apdex_satisfied_threshold=100`
`jmeter.reportgenerator.apdex_tolerated_threshold=500`

Spring-boot simply out-performed Vert.x both in Apdex term (0.754 vs 0.066) and throughput (1429 vs 776 transactions/sec).

I also created a [Symfony](https://symfony.com/) 4 microservices project to run with Apache 2 httpd server, but the test result failed so it can't be comparable.

* Detailed comparison
For more details, please have a look at the charts below or view the JMeter result:

Toolkit | Result | Detail link
-|-|-
Spring-boot | Very good | [result/spring/index.html](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/spring/index.html)
Vert.x | Acceptable | [result/vertx/index.html](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/vertx/index.html)
Symfony | Failed | [result/symfony/index.html](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/symfony/index.html)

* Spring-boot performance over time

![Spring-boot over-time metrics](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/springboot-over-time-metrics.png)

* Vert.x performance over time

![Vert.x over-time metrics](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/vertx-over-time-metrics.png)

* Spring-boot throughput

![Spring-boot throughput](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/springboot-over-through-put.png)

* Vert.x throughput

![Vert.x throughput](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/vertx-through-put.png)

* Spring-boot response time

![Spring-boot over-time metrics](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/springboot-reponse-time.png)

* Vert.x response time

![Vert.x over-time metrics](https://github.com/namnvhue/reactive-programming-performance/blob/master/result/images/vertx-reponse-time.png)

# What is Reactive Programming again?
Not a formal definition but according to [wikipedia](https://en.wikipedia.org/wiki/Reactive_programming):

> **Reactive programming** is a [programming paradigm](https://en.wikipedia.org/wiki/Programming_paradigm) oriented around [data flows](https://en.wikipedia.org/wiki/Dataflow_programming) and the propagation of change. This means that it should be possible to express static or dynamic data flows with ease in the programming languages used and that the underlying execution model will automatically propagate changes through the data flow

Spring-boot and Vert.x can help us start with Reactive Programming easily to work on a concrete problem, but for more general concepts I always find the following links helpful:

[The Reactive Manifesto](https://www.reactivemanifesto.org/)

[The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)

[RxJava](https://github.com/ReactiveX/RxJava)

# Some issues
1. "java.net.BindException: Address already in use: connect" jMeter issue on Windows
If you have problem running the test on Windows with a large number of threads please create the following registry entry:  
  - Location: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters`
  - Value Name: MaxUserPort
  - Value Type: DWORD
  - Value data: 65534
  - Valid Range: 5000-65534 (decimal)
  - Default: 0x1388 (5000 decimal)

For more details, please consider following this link: [https://www.baselogic.com/2011/11/23/solved-java-net-bindexception-address-use-connect-issue-windows/](https://www.baselogic.com/2011/11/23/solved-java-net-bindexception-address-use-connect-issue-windows/)

2. Configure virtual host for Symfony
During this kind of test, please avoid Symfony built-in web server and instead configure a proper web-server
[https://symfony.com/doc/current/setup/web_server_configuration.html](https://symfony.com/doc/current/setup/web_server_configuration.html)
