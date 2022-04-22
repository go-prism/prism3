DROP TRIGGER IF EXISTS trigger_{{ .Table }}_update on {{ .Table }};

CREATE OR REPLACE FUNCTION notify_{{ .Table }}_update() RETURNS TRIGGER AS
$$
DECLARE
    row RECORD;
    output JSON;
BEGIN
    -- Checking the Operation Type
    IF (TG_OP = 'DELETE') THEN
      row := OLD;
    ELSE
      row := NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        {{ range .Columns }}
        IF (OLD.{{ . }} IS NOT DISTINCT FROM NEW.{{ . }}) THEN
            RETURN NULL;
        END IF;
        {{ end }}
    END IF;

    -- Forming the Output as notification. You can choose you own notification.
    output = json_build_object(
        'operation', TG_OP,
        'id', row.id,
        'table', TG_TABLE_NAME,
        'timestamp', CURRENT_TIMESTAMP
    );

    -- Calling the pg_notify for my_table_update event with output as payload
    PERFORM pg_notify('{{ .Table }}_update', output::text);

    -- Returning null because it is an after trigger.
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_{{ .Table }}_update AFTER INSERT OR UPDATE OR DELETE ON {{ .Table }} FOR EACH ROW EXECUTE PROCEDURE notify_{{ .Table }}_update();
