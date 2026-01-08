package poll

import "database/sql"

type Repository struct {
	DB *sql.DB
}

// ✅ Constructor
func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) CreatePoll(p Poll) (int64, error) {
	res, err := r.DB.Exec(
		`INSERT INTO polls (question, type, created_by, ends_at)
		 VALUES (?, ?, ?, ?)`,
		p.Question, p.Type, p.CreatedBy, p.EndsAt,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *Repository) AddOption(pollID int64, text string) error {
	_, err := r.DB.Exec(
		`INSERT INTO poll_options (poll_id, option_text)
		 VALUES (?, ?)`,
		pollID, text,
	)
	return err
}

func (r *Repository) HasUserVoted(pollID, userID int64) (bool, error) {
	row := r.DB.QueryRow(
		`SELECT COUNT(*) FROM votes
		 WHERE poll_id=? AND user_id=?`,
		pollID, userID,
	)
	var count int
	err := row.Scan(&count)
	return count > 0, err
}

func (r *Repository) Vote(pollID, optionID, userID int64) error {
	_, err := r.DB.Exec(
		`INSERT INTO votes (poll_id, option_id, user_id)
		 VALUES (?, ?, ?)`,
		pollID, optionID, userID,
	)
	return err
}
