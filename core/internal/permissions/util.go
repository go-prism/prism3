package permissions

import (
	"fmt"
	"sort"
	"strings"
)

// NormalUser normalises a cap10 username
// so that it can be easily compared.
func NormalUser(s string) string {
	iss, sub, ok := strings.Cut(s, "/")
	if !ok {
		return s
	}
	bitsIss := strings.Split(iss, ",")
	sort.Strings(bitsIss)
	bitsSub := strings.Split(sub, ",")
	sort.Strings(bitsSub)
	return fmt.Sprintf("%s/%s", strings.Join(bitsIss, ","), strings.Join(bitsSub, ","))
}

// UserEquals checks that two cap10
// usernames are equal.
func UserEquals(a, b string) bool {
	issA, subA, ok := strings.Cut(a, "/")
	if !ok {
		return false
	}
	issB, subB, ok := strings.Cut(b, "/")
	if !ok {
		return false
	}
	// check shortcuts
	if a == b {
		return true
	}
	return DnEquals(issA, issB) && DnEquals(subA, subB)
}

// DnEquals checks that two distinguished
// names are equal.
func DnEquals(a, b string) bool {
	// check shortcuts
	if a == b {
		return true
	}
	aBits := strings.Split(a, ",")
	bBits := strings.Split(b, ",")
	trim(aBits)
	trim(bBits)

	if len(aBits) != len(bBits) {
		return false
	}

	sort.Strings(aBits)
	sort.Strings(bBits)

	for i := range aBits {
		if aBits[i] != bBits[i] {
			return false
		}
	}

	return true
}

func trim(s []string) {
	for i := range s {
		s[i] = strings.TrimSpace(s[i])
	}
}
