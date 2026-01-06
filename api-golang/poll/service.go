package poll

import "errors"

type Service struct {
	Repo *Repository
}

// ✅ Constructor
func NewService(repo *Repository) *Service {
	return &Service{Repo: repo}
}

func (s *Service) CreatePoll(req CreatePollRequest, userID int64) (int64, error) {
	if len(req.Options) < 2 || len(req.Options) > 10 {
		return 0, errors.New("le poll doit contenir entre 2 et 10 options")
	}

	pollID, err := s.Repo.CreatePoll(Poll{
		Question:  req.Question,
		Type:      req.Type,
		CreatedBy: userID,
		EndsAt:    req.EndsAt,
	})
	if err != nil {
		return 0, err
	}

	for _, opt := range req.Options {
		err := s.Repo.AddOption(pollID, opt)
		if err != nil {
			return 0, err
		}
	}

	return pollID, nil
}

func (s *Service) Vote(poll Poll, req VoteRequest, userID int64) error {
	if poll.IsClosed {
		return errors.New("poll fermé")
	}

	voted, err := s.Repo.HasUserVoted(poll.ID, userID)
	if err != nil {
		return err
	}
	if voted {
		return errors.New("utilisateur a déjà voté")
	}

	if poll.Type == "single" && len(req.OptionIDs) != 1 {
		return errors.New("choix unique requis")
	}

	for _, optID := range req.OptionIDs {
		err := s.Repo.Vote(poll.ID, optID, userID)
		if err != nil {
			return err
		}
	}

	return nil
}
