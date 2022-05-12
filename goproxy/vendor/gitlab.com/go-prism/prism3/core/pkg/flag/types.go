package flag

type Options struct {
	Token string `split_words:"true"`
	Name  string `split_words:"true" default:"prism3-core"`
	URL   string `split_words:"true"`
	Env   string `split_words:"true"`
}
