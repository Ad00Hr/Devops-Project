package poll

import "errors"

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{Repo: repo}
}

// --- PARTIE 1 : ECRITURE ---

func (s *Service) CreatePoll(req CreatePollRequest, userID int64) (int64, error) {
<<<<<<< HEAD
<<<<<<< HEAD
	// 1. Validation de la question
=======
<<<<<<< HEAD
<<<<<<< HEAD
	// 1. Validation de la question (Fix l-panic)
>>>>>>> e788922 (Revert "merge: synchronisation avec la branche distante")
=======
	// 1. Validation de la question
>>>>>>> 44ccb4a (added UI + fixed endpoints and  cors api with react + added documentatio)
	if req.Question == "" {
		return 0, errors.New("la question ne peut pas être vide")
	}

	// 2. Validation des options
	if len(req.Options) < 2 || len(req.Options) > 10 {
		return 0, errors.New("le poll doit contenir entre 2 et 10 options")
	}

	// 3. Insertion du Poll
	pollID, err := s.Repo.CreatePoll(Poll{
		Question:  req.Question,
		Type:      req.Type,
		CreatedBy: userID,
		EndsAt:    req.EndsAt,
	})
	if err != nil {
		return 0, err
	}

	// 4. Insertion des options
	for _, opt := range req.Options {
		err := s.Repo.AddOption(pollID, opt)
		if err != nil {
			return 0, err
		}
	}

	// Return pollID
	return pollID, nil
}

func (s *Service) Vote(poll Poll, req VoteRequest, userID int64) error {
	// 1. Vérifications basiques
	if poll.IsClosed {
		return errors.New("poll fermé")
	}

	// 2. Vérifier si déjà voté
	voted, err := s.Repo.HasUserVoted(poll.ID, userID)
	if err != nil {
		return err
	}
	if voted {
		return errors.New("utilisateur a déjà voté")
	}

	// 3. Vérifier type single
	if poll.Type == "single" && len(req.OptionIDs) != 1 {
		return errors.New("choix unique requis")
	}

	// 4. Enregistrer le vote
	for _, optID := range req.OptionIDs {
		err := s.Repo.Vote(poll.ID, optID, userID)
		if err != nil {
			return err
		}
	}
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
    if req.Question == "" {
        return 0, errors.New("la question ne peut pas être vide")
    }

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
    // 1. Vérifications basiques
    if poll.IsClosed {
        return errors.New("poll fermé")
    }

    // 2. Vérifier si déjà voté
    voted, err := s.Repo.HasUserVoted(poll.ID, userID)
    if err != nil {
        return err
    }
    if voted {
        return errors.New("utilisateur a déjà voté")
    }

    // 3. Vérifier type single
    if poll.Type == "single" && len(req.OptionIDs) != 1 {
        return errors.New("choix unique requis")
    }

    // 4. Enregistrer le vote
    for _, optID := range req.OptionIDs {
        // Optionnel : Tu peux vérifier ici si optID appartient bien à poll.ID
        // pour éviter qu'un user vote pour une option d'un autre sondage.
        err := s.Repo.Vote(poll.ID, optID, userID)
        if err != nil {
            return err
        }
    }
>>>>>>> b2c29e9ff7143e62ddf524c8e02ff9b91223f143
=======
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
>>>>>>> parent of 6266b5c (merge: synchronisation avec la branche distante)
>>>>>>> e788922 (Revert "merge: synchronisation avec la branche distante")
=======
>>>>>>> 44ccb4a (added UI + fixed endpoints and  cors api with react + added documentatio)

	return nil
}

// --- PARTIE 2 : LECTURE ---

// GetPoll : Récupère un poll avec ses options
func (s *Service) GetPoll(pollID int64) (*Poll, error) {
	// 1. Récupère les infos du poll
	poll, err := s.Repo.GetPoll(pollID)
	if err != nil {
		return nil, err
	}

	// 2. Récupère les options
	options, err := s.Repo.GetPollOptions(pollID)
	if err != nil {
		return nil, err
	}

	// 3. Assemble
	poll.Options = options
	return poll, nil
}

// GetAllPolls : Pour la liste - inclut les options pour chaque poll
func (s *Service) GetAllPolls() ([]Poll, error) {
	polls, err := s.Repo.GetAllPolls()
	if err != nil {
		return nil, err
	}

	// Pour chaque poll, récupère ses options
	for i := range polls {
		options, err := s.Repo.GetPollOptions(polls[i].ID)
		if err != nil {
			return nil, err
		}
		polls[i].Options = options
	}

	return polls, nil
}
