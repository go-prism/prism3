package tasks

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
)

func Serialise(payload any) ([]byte, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.WithError(err).Errorf("failed to serialise payload of type: %T", payload)
		return nil, err
	}
	return data, nil
}

func Deserialise(data []byte, v any) error {
	if err := json.Unmarshal(data, v); err != nil {
		log.WithError(err).Errorf("failed to deserialise payload of type: %T", v)
		return err
	}
	return nil
}
