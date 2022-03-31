package flag

import "github.com/Unleash/unleash-client-go/v3"

var defaultClient *unleash.Client

// Initialize will specify the options to be used by the default client.
func Initialize(options ...unleash.ConfigOption) error {
	return unleash.Initialize(options...)
}

// IsEnabled queries the default client whether or not the specified feature is enabled or not.
func IsEnabled(feature string, options ...unleash.FeatureOption) bool {
	if defaultClient == nil {
		return false
	}
	return unleash.IsEnabled(feature, options...)
}
