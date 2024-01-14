import mongoose from 'mongoose';
import Parser from 'rss-parser';
import { squealRead_t } from '../validators/squealValidators';

const baseSqueal: squealRead_t = {
  id: '0',
  author: '@isaacasimov',
  datetime: new Date(),
  body: {
    type: 'text',
    content: 'template',
  },
  receivers: ['#temp'],
  comments: [],
  category: ['public', 'automatic'],
  reacted: true,
  impressions: 0,
  negative_reaction: 0,
  positive_reaction: 0,
};

const generateIMAGE = (n: number) => {
  return async (): Promise<squealRead_t[]> => {
    return Array.from({ length: n }, () => {
      const newId = new mongoose.Types.ObjectId().toString();
      return {
        ...baseSqueal,
        id: newId,
        body: {
          type: 'media',
          content: `https://picsum.photos/seed/${newId}/200/300`,
        },
        receivers: [`§IMAGE_${n}`],
        author: '@picsum',
      };
    });
  };
};

const generateNEWS = (feedUrl: string) => {
  return async (): Promise<squealRead_t[]> => {
    const parser = new Parser();
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items
      .map((item) => {
        if (!item.contentSnippet && !item.pubDate) return null;
        else return item;
      })
      .filter((s): s is Required<Parser.Item> => s !== null);

    return items.map((item) => {
      return {
        ...baseSqueal,
        id: new mongoose.Types.ObjectId().toString(),
        datetime: new Date(item.pubDate),
        body: {
          type: 'text',
          content: item.contentSnippet,
        },
        receivers: ['§NEWS'],
        author: '@corrieredellasera',
      };
    });
  };
};

type automaticChannelsList_t = Record<string, () => Promise<squealRead_t[]>>;

const automaticChannelsList: automaticChannelsList_t = {
  '§IMAGE_100': generateIMAGE(100),
  '§IMAGE_1000': generateIMAGE(1000),
  '§NEWS': generateNEWS('https://xml2.corriereobjects.it/rss/homepage.xml'),
};

export { automaticChannelsList };

