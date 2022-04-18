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

// JSONMap defined JSON data type, need to implements driver.Valuer, sql.Scanner interface
type JSONMap map[string]string

// Value return json value, implement driver.Valuer interface
func (m JSONMap) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	ba, err := m.MarshalJSON()
	return string(ba), err
}

// Scan scan value into Jsonb, implements sql.Scanner interface
func (m *JSONMap) Scan(val any) error {
	var ba []byte
	switch v := val.(type) {
	case []byte:
		ba = v
	case string:
		ba = []byte(v)
	default:
		return fmt.Errorf("failed to unmarshal JSONB value: %+v", val)
	}
	var t map[string]string
	err := json.Unmarshal(ba, &t)
	*m = t
	return err
}

// MarshalJSON to output non base64 encoded []byte
func (m JSONMap) MarshalJSON() ([]byte, error) {
	if m == nil {
		return []byte("null"), nil
	}
	t := (map[string]string)(m)
	return json.Marshal(t)
}

// UnmarshalJSON to deserialize []byte
func (m *JSONMap) UnmarshalJSON(b []byte) error {
	var t map[string]string
	err := json.Unmarshal(b, &t)
	*m = t
	return err
}

// GormDataType gorm common data type
func (m JSONMap) GormDataType() string {
	return "jsonmap"
}

// GormDBDataType gorm db data type
func (JSONMap) GormDBDataType(db *gorm.DB, _ *schema.Field) string {
	switch db.Dialector.Name() {
	case "sqlite":
		return "JSON"
	case "mysql":
		return "JSON"
	case "postgres":
		return "JSONB"
	case "sqlserver":
		return "NVARCHAR(MAX)"
	}
	return ""
}

// UnmarshalGQL implements the graphql.Unmarshaler interface
func (m *JSONMap) UnmarshalGQL(v any) error {
	val, ok := v.(map[string]string)
	if !ok {
		return errors.New("JSONMap must be a JSON object")
	}
	*m = val
	return nil
}

// MarshalGQL implements the graphql.Marshaler interface
func (m JSONMap) MarshalGQL(w io.Writer) {
	if m == nil {
		_, _ = w.Write([]byte("{}"))
		return
	}
	t := (map[string]string)(m)
	_ = json.NewEncoder(w).Encode(t)
}
