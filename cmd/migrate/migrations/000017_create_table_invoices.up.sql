CREATE TABLE IF NOT EXISTS invoices (
	id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
	external_id text NOT NULL,
	invoice_id text NOT NULL,
	status text NOT NULL,
	amount numeric NOT NULL,
	created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);