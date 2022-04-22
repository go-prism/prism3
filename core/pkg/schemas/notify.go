package schemas

import "gitlab.com/go-prism/prism3/core/pkg/db/notify"

var NotifyTables = []notify.ListenerOpts{
	{
		Table:   TableNameStoredUsers,
		Columns: []string{"preferences"},
	},
}
