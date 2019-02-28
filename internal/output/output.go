package output

import (
	"io"
	"os"
)

func CaptureAllOutput(to io.Writer) error {
	piper, pipew, err := os.Pipe()
	if err != nil {
		return err
	}

	os.Stdout = piper
	os.Stderr = piper

	go func() {
		_, err := io.Copy(to, pipew)
		if err != nil {
			// this space intentionally left blank
		}
	}()
	return nil
}
