package datatypes

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"io"
)

// JSONArray defined JSON data type, need to implements driver.Valuer, sql.Scanner interface
type JSONArray []string

// Value return json value, implement driver.Valuer interface
func (m JSONArray) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	ba, err := m.MarshalJSON()
	return string(ba), err
}

// Scan scan value into Jsonb, implements sql.Scanner interface
func (m *JSONArray) Scan(val interface{}) error {
	var ba []byte
	switch v := val.(type) {
	case []byte:
		ba = v
	case string:
		ba = []byte(v)
	default:
		return fmt.Errorf("failed to unmarshal JSONB value: %+v", val)
	}
	var t []string
	err := json.Unmarshal(ba, &t)
	*m = t
	return err
}

// MarshalJSON to output non base64 encoded []byte
func (m JSONArray) MarshalJSON() ([]byte, error) {
	if m == nil {
		return []byte("null"), nil
	}
	t := ([]string)(m)
	return json.Marshal(t)
}

// UnmarshalJSON to deserialize []byte
func (m *JSONArray) UnmarshalJSON(b []byte) error {
	var t []string
	err := json.Unmarshal(b, &t)
	*m = t
	return err
}

// GormDataType gorm common data type
func (m JSONArray) GormDataType() string {
	return "jsonarray"
}

// GormDBDataType gorm db data type
func (JSONArray) GormDBDataType(db *gorm.DB, _ *schema.Field) string {
	switch db.Dialector.Name() {
	case "sqlite":
		return "JSON"
	case "mysql":
		return "JSON"
	case "postgres":
		return "JSONB"
	}
	return ""
}

// UnmarshalGQL implements the graphql.Unmarshaler interface
func (m *JSONArray) UnmarshalGQL(v interface{}) error {
	val, ok := v.([]string)
	if !ok {
		return errors.New("JSONArray must be a JSON array")
	}
	*m = val
	return nil
}

// MarshalGQL implements the graphql.Marshaler interface
func (m JSONArray) MarshalGQL(w io.Writer) {
	if m == nil {
		_, _ = w.Write([]byte("null"))
		return
	}
	t := ([]string)(m)
	_ = json.NewEncoder(w).Encode(t)
}
