import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../models/user';
import { useAPIAuth } from '../../../utils/useAPIAuth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === `GET`) {
    const users = await User.find({});

    return res.status(200).send({ users });
  }

  return null;
};
