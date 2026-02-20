import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createDeck = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const deck = await prisma.flashcardDeck.create({
            data: { title, description }
        });

        res.status(201).json(deck);
    } catch (error) {
        res.status(500).json({ error: 'Server error creating deck' });
    }
};

export const getDecks = async (req: Request, res: Response) => {
    try {
        const decks = await prisma.flashcardDeck.findMany({
            include: {
                _count: {
                    select: { cards: true }
                }
            }
        });
        res.json(decks);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching decks' });
    }
};

export const getCardsForDeck = async (req: Request, res: Response) => {
    try {
        const { deckId } = req.params;
        const cards = await prisma.flashcard.findMany({
            where: { deckId: deckId as string }
        });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching cards' });
    }
};

export const createCard = async (req: Request, res: Response) => {
    try {
        const { deckId } = req.params;
        const { front, back } = req.body;

        if (!front || !back) return res.status(400).json({ error: 'Front and back text required' });

        const card = await prisma.flashcard.create({
            data: { deckId: deckId as string, front, back }
        });

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Server error creating card' });
    }
};

export const deleteCard = async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        await prisma.flashcard.delete({
            where: { id: cardId as string }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting card' });
    }
};
