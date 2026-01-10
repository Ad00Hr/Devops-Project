package poll

import "errors"

type Service struct {
    Repo *Repository
}

func NewService(repo *Repository) *Service {
    return &Service{Repo: repo}
}

// --- PARTIE 1 : ECRITURE (Ce que tu as déjà fait) ---

func (s *Service) CreatePoll(req CreatePollRequest, userID int64) (int64, error) {
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

    return nil
}

// --- PARTIE 2 : LECTURE (Zid hadchi darori) ---

// GetPoll : Hada kayjib Poll + Options dyalo
func (s *Service) GetPoll(pollID int64) (*Poll, error) {
    // 1. Jeb les infos du Poll
    poll, err := s.Repo.GetPoll(pollID)
    if err != nil {
        return nil, err
    }

    // 2. Jeb les options dyalo
    options, err := s.Repo.GetPollOptions(pollID)
    if err != nil {
        return nil, err
    }

    // 3. Jm3hom
    poll.Options = options
    return poll, nil
}

// GetAllPolls : Pour la liste
func (s *Service) GetAllPolls() ([]Poll, error) {
    return s.Repo.GetAllPolls()
}