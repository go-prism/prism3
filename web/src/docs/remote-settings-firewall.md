# Firewall rules

Prism provides administrators with the ability to enforce custom policies that control when Prism is allowed to query a Remote.
Firewall rules are written using Regular Expressions, specifically with the [Go/RE2 syntax](https://golang.org/s/re2syntax).

It does this through Remote Firewall Rules. Rules offer two modes:
1. Blocking
2. Allowing

## Blocking

When adding a blocking rule, Prism will *reject requests that match the rule*.
For example, the rule `^my-project/` will reject any requests that start with `my-project/`.

## Allowing

When adding an allowing rule, Prism will only *allow requests that match the rule*.
**All other requests will be denied.**
For example, the rule `^my-project/` will only allow requests that start with `my-project/`.
