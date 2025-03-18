package mailer

import (
	"bytes"
	"embed"
	"fmt"
	"net/smtp"
	"text/template"
	"time"
)

const (
	FromName            = "Govel"
	maxRetries          = 3
	UserWelcomeTemplate = "user_invitations.tmpl"
	ForgotPassReqTemplate = "reset_password_req.tmpl"
)

//go:embed "templates"
var FS embed.FS

type SMTPMailer struct {
	smtpHost string
	smtpPort string
	username string
	password string
}

func NewSMTPMailer(host, port, username, password string) *SMTPMailer {
	return &SMTPMailer{
		smtpHost:  host,
		smtpPort:  port,
		username:  username,
		password:  password,
	}
}

func (m *SMTPMailer) Send(templateFile, username, email string, data any) error {
	tmpl, err := template.ParseFS(FS, "templates/"+templateFile)
	if err != nil {
		return err
	}

	subject := new(bytes.Buffer)
	if err := tmpl.ExecuteTemplate(subject, "subject", data); err != nil {
		return err
	}

	body := new(bytes.Buffer)
	if err := tmpl.ExecuteTemplate(body, "body", data); err != nil {
		return err
	}

	message := fmt.Sprintf("From: %s\nTo: %s\nSubject: %s\nMIME-Version: 1.0\nContent-Type: text/html; charset=UTF-8\n\n%s",
    m.username, email, subject.String(), body.String())

	auth := smtp.PlainAuth("", m.username, m.password, m.smtpHost)

	var retryErr error
	for i := 0; i < maxRetries; i++ {
		retryErr = smtp.SendMail(m.smtpHost+":"+m.smtpPort, auth, m.username, []string{email}, []byte(message))
		if retryErr != nil {
			time.Sleep(time.Second * time.Duration(i+1))
			continue
		}
		return nil
	}

	return fmt.Errorf("failed to send email after %d attempts, error: %v", maxRetries, retryErr)
}
