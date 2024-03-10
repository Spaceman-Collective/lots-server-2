// pages/api/download.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function download(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.item.findMany();

      const processedItems = items.map(item => ({
        ...item,
        effects: item.effects ? JSON.parse(item.effects) : null,
      }));

      res.status(200).json(processedItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      res.status(500).json({ error: 'Failed to fetch items from the database.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
