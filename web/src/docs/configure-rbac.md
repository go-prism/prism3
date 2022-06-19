# Role Based Access Control (RBAC)

Prism uses a method of Authorization known as Role-Based-Access-Control (RBAC).
RBAC restricts access to resources by requiring users to be bound to *roles*.
Roles contain a set of permissions and define what a user is allowed to do.

## Roles

A role is made up of a resource and a verb.
A resource is something that a user would like to gain access to (e.g., Remote or Refraction) while a verb is the actions that the user is allowed to do to the resource (e.g., view or delete).

### Verbs

* Create - create resources
* Read - view the resource
* Update - modify the resource
* Delete - delete the resource
* Sudo - all of the above
