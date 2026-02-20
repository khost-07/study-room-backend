import { Router } from 'express';
import { createDeck, getDecks, getCardsForDeck, createCard, deleteCard } from '../controllers/flashcard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // Protect all flashcard routes

router.get('/decks', getDecks);
router.post('/decks', createDeck);
router.get('/decks/:deckId/cards', getCardsForDeck);
router.post('/decks/:deckId/cards', createCard);
router.delete('/cards/:cardId', deleteCard);

export default router;
