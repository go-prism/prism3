package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-logr/logr"
)

func Serialise(ctx context.Context, payload any) ([]byte, error) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(3).Info("serialising payload", "Payload", payload)
	data, err := json.Marshal(payload)
	if err != nil {
		log.Error(err, "failed to serialise payload", "Type", fmt.Sprintf("%T", payload))
		return nil, err
	}
	log.V(3).Info("serialised payload", "Raw", string(data))
	return data, nil
}

func Deserialise(ctx context.Context, data []byte, v any) error {
	log := logr.FromContextOrDiscard(ctx)
	log.V(3).Info("deserialising payload", "Raw", string(data))
	if err := json.Unmarshal(data, v); err != nil {
		log.Error(err, "failed to deserialise payload", "Type", fmt.Sprintf("%T", v))
		return err
	}
	log.V(3).Info("deserialised payload", "Payload", v)
	return nil
}
