import type { NextApiRequest, NextApiResponse } from 'next';

type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  callback: (result?: Error | unknown) => void
) => void;

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Middleware) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result?: Error | unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });

export default runMiddleware;
