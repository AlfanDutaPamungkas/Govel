package swagger

type EnvelopeString struct {
	Data string `json:"data"`
}

type EnvelopeError struct {
	Error string `json:"error"`
}
