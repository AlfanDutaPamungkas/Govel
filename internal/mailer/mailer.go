package mailer

import (
	"bytes"
	"crypto/tls"
	"embed"
	"fmt"
	"net/smtp"
	"text/template"
	"time"
)

const (
	FromName              = "Govel"
	maxRetries            = 3
	UserWelcomeTemplate   = "user_invitations.tmpl"
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

	message := fmt.Sprintf(
		"From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		FromName,
		m.username,
		email,
		subject.String(),
		body.String(),
	)

	var retryErr error
	for i := 0; i < maxRetries; i++ {
		retryErr = m.sendTLS(email, message)
		if retryErr != nil {
			time.Sleep(time.Duration(i+1) * time.Second)
			continue
		}
		return nil
	}

	return fmt.Errorf("failed to send email after %d attempts, error: %v", maxRetries, retryErr)
}

func (m *SMTPMailer) sendTLS(to, msg string) error {
	addr := m.smtpHost + ":" + m.smtpPort

	// Establish TLS connection manually
	conn, err := tls.Dial("tcp", addr, &tls.Config{
		InsecureSkipVerify: true, // ✅ disable only for dev/testing
		ServerName:         m.smtpHost,
	})
	if err != nil {
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, m.smtpHost)
	if err != nil {
		return err
	}
	defer client.Close()

	auth := smtp.PlainAuth("", m.username, m.password, m.smtpHost)
	if err := client.Auth(auth); err != nil {
		return err
	}

	if err := client.Mail(m.username); err != nil {
		return err
	}
	if err := client.Rcpt(to); err != nil {
		return err
	}

	w, err := client.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(msg))
	if err != nil {
		return err
	}
	w.Close()

	return client.Quit()
}
