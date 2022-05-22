# Authorisation

Prism supports 3 authorisation modes:
1. None
2. Pass-through
3. Direct

## None

No authentication information will be sent to the remote, even if included by the user.
This is useful for Remotes that target public sources such as Maven Central or NPM.

## Pass-through

Pass-through proxies' authentication information provided by the user to the Remote.
For example, if a user sets the `Authorization` HTTP header, Prism will copy the header and include that in the request it makes to the Remote.

To ensure that security is maintained, Prism will create a cache partition for each unique authentication token it receives.
The authentication token is hashed is used to create the partition.

### GitLab Remotes

[https://docs.gitlab.com/ee/ci/jobs/ci_job_token.html](https://docs.gitlab.com/ee/ci/jobs/ci_job_token.html)

GitLab CI provides an authentication token called the `ci_job_token` which is usable only for the duration of the pipeline.
To ensure that Prism doesn't create a partition for each individual pipeline, it will query the GitLab API to find the ID of the user that triggered the pipeline and that will be used to create the partition.

This is done transparently and automatically if the `Job-Token` HTTP header is added to the list of pass-through headers.

## Direct

Direct authentication allows a Prism administrator to provide credentials that Prism will use when querying a Remote.
Any credentials provided by a user will be replaced by the Remotes credentials.
