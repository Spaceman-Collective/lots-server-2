// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../prisma/client';
import { IncomingForm } from 'formidable';
import { Item } from '@prisma/client';
import { promises as fsPromises } from 'fs';
import { ItemSchema } from '../../schemas/itemSchema';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ItemInput extends Omit<Item, 'effects'> {
  effects: string;
}

function isValidItemInput(input: any): input is ItemInput {
  const validationResult = ItemSchema.safeParse(input);
  if (validationResult.success) {
    console.log('Valid item input, processing...');
    return true;
  } else {
    console.error('Invalid item input:', validationResult.error);
    return false;
  }
}

function processItems(itemData: ItemInput[] | ItemInput): Item[] {
  if (!Array.isArray(itemData)) {
    itemData = [itemData];
  }
  return itemData.map((item: ItemInput) => ({
    ...item,
    effects: JSON.stringify(item.effects),
  }));
}

async function loadItems(items: Item[]): Promise<void> {
  for (const item of items) {
    try {
      if (isValidItemInput(item)) {
        await prisma.item.upsert({
          where: { id: item.id },
          update: {},
          create: item as Item,
        }).catch(e => console.error(`Error upserting item ${item.id}:`, e));
      } else {
        console.error('Invalid item input:', item);
        throw new Error('Invalid item input');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Invalid item input');
    }
  }
}

export default async function upload(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form: any = new IncomingForm();
    form.uploadDir = "./public/uploads";
    form.keepExtensions = true;
    form.parse(req, async (err: Error, fields: any, files: any) => {
      if (err) {
        res.status(500).json({ error: 'Error parsing the files' });
        return;
      }

      try {
        const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
        const itemsToLoad: ItemInput[] = [];

        for (const file of uploadedFiles) {
          if (file) {
            const filePath = file.filepath;
            const fileContent = await fsPromises.readFile(filePath, 'utf8');
            const itemData: ItemInput | ItemInput[] = JSON.parse(fileContent);
            const processedItems: ItemInput[] = processItems(itemData);
            itemsToLoad.push(...processedItems);

            // remove files after processing
            await fsPromises.unlink(filePath);
          }
        }

        try {
          await loadItems(itemsToLoad);
          res.status(200).json({ message: 'Items uploaded and processed successfully.' });
        } catch (error) {
          if (error instanceof Error) {
            res.status(500).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Unknown error occurred.' });
          }
        }
        res.status(200).json({ message: 'Items uploaded and processed successfully.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing or uploading items.' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
