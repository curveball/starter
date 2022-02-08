WSLB Design document
====================

Note: this is my first shot at this, so I'll probably discover that some of
these ideas aren't gonna work in practice.


General design
--------------

This service will be built so it can take many incoming Websocket connections,
and distribute them across different services (now called Workers)

At the moment each worker will only be able to handle 1 active connection,
but in the future we'll expand this to be configurable, or based on 'complexity'
of the work workers are currently doing.

If a user disconnects, their session is still continuing on their existing
worker, and reconnecting should result in hitting the same worker.

The load balancer itself should be load balanced. We should be able to put
multiple ELB instances in front of it (running in TCP mode?).

This means that the 'table' of which user is using which worker needs to be
shared between multiple wslb instances.

Finally, the load balancer is also responsible for managing the size of the
worker pool. It should keep a few workers ready to go, and when more users
connect it should automatically fire up new workers, as well as turn them
off when they are done.

### Stack

I'm writing this in Node.js, 100% Typescript, using the [ws][2] library.
I _might_ use our own [Curveball][3] framework if I'm building in a HTTP
status page.


Identifying users
-----------------

Ideally we would have *some* header sent along with the websocket that helps
us establish which user is which, so we can send them to the correct server
after a re-connect.

So far I've not been able to see if any such HTTP headers are sent.

My ideal situation would be that the load balancer can basically be fully
agnostic to what's sent over the websocket, and only use headers to create
sticky sessions, but we'll find out more later!


Load balanced sticky sessions
-----------------------------

If we are going to 'load balance the load balancer', then each server needs
to know the user->worker mapping.

This implies that each instance of the load balancer needs to share state.

For each worker we'll need to know something like the following:


```json
{
  "host": "ip-10-0-2-110.eu-central-1.compute.internal",
  "instanceId": "i-0e214a342f3239fd3",
  "lastSeen": "2022-02-08T15:27:00Z",
  "connectedUsers": [
    "userId1",
  ],
  "userLimit": 1,
  "status": "healthy"
}
```

One of the challenges will be that if multiple users are connecting at the
same time from different load balaners, we could get a race condition and
connect them to the same one.

This means we need the operation of adding a user to a worker to use a
locking mechanism.

I'm inclined to build all the shared-storage with Redis, because this has
the following propeties:

1. We don't care about long-term storage
2. Amazon has a good hosted service for this (elasticache).
3. It can easily run on developer machines (`apt install redis / brew install redis`).
4. It's portable

With Redis we can implement a [distributed lock mechanism][1].


Scaling
-------

Workers can go through several lifecycle events:

1. Starting 🎬
2. Healthy 🥗
3. Unhealthy 🤮
4. Dead ⚰️

It makes sense to me that all these events are updated by lambda functions so
this logic can be centralized and doesn't need to be reimplemented by each
service that initiates the status change.

The load balancer is responsible for maintaining a pool of workers, and if the
pool is too small it should initiate starting new instances.

To avoid race conditions with this, only 1 wslb instances should be allowed to
make changes to the pool size. The easiest way to do this is to simple reserve
another Redis distributed lock.

One thing that will need to be solved here is that if a 'reserve pool size' of
say, 5, and users are rapidly starting/ending sessions we don't fire up/kill
a ton of workers in a short period.

The easiest algorithm I can think of right now is to have a maxium and minimum
'spare workers'.

For example, maybe we at least 2 workers spare, but at most 5 spare workers.
Only if the number of idle workers exceed 5 we will kill some, and only when
the number of idle workers is below 2 we'll launch some.

This buffer will prevent flip-flopping I think.

Note: I opted to not dive into auto-scaling systems here. This seemed simpler,
but very open to ideas here ofc!

Note  2: We need to test the scenario where we have a lot of users connecting
at the same time, and they are being held in a queue until we have available
workers.

### Cleaning up idle connections

If a user does nothing for a while (how long), we want to free the worker
server up for a new session.

This is already happening on the worker, but we don't have a way to report
this back to the load balancer. So, for this we need another lambda.

Future idea: complexity based workers
-------------------------------------

My understanding is that for now we want just 1 session per worker, and might
experiment with more than 1.

However, different sessions have different complexity. Some sessions can
comfortably sit together with 4-5 other sessions on a single worker, while
others need a dedicated machine.

Instead of measuring capacity by sessions, maybe there's some number we can
figure out that is an approximation for how complex the scene is.

For example, if each server can handle a budget of '1000 complexity', maybe
we can know it can compfortably support 3 sessions that have a complexity of
100, 300 and 600 for example?

Or maybe a simpler solution is simply to mark sessions as 'complex' and
'not complex'. Maybe 'complex' always needs a dedicated machine, and
'not complex' can support 4 sessions?


[1]: https://redis.io/topics/distlock
[2]: https://www.npmjs.com/package/ws
[3]: https://curveballjs.org/
