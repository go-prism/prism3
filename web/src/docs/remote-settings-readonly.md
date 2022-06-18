# Read-only remotes

Some remotes and refractions are read-only and cannot be modified (even by an administrator).
These resources are created by the Prism system and are read-only as tampering with them can cause undefined behaviour.

## Go

Both the *"go"* Remote and Refraction are read-only as the `GOPROXY` API works outside the bounds of the standard Prism API.

The `GOPROXY` API uses the same `go` toolchain that you might use during development and therefore needs to be bundled separately to the standard Prism API.
Because of this, Prism disables modifications to the Remote and Refraction as any changes would be ignored.
