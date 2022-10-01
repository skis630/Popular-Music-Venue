import { rest } from "msw";

import { showsUrl } from "../features/tickets/redux/showApi";
import { bandUrl } from "../features/band/redux/bandApi";
import { bands, shows } from "../test-utils/fake-data";

export const handlers = [
  rest.get(showsUrl, (req, res, ctx) => {
    return res(ctx.json({ shows }));
  }),
  rest.get(`${bandUrl}:bandId`, (req, res, ctx) => {
    const { bandId } = req.params;

    // bandId is conveniently the index in the bands array
    return res(ctx.json({ band: bands[bandId] }))
  })
];
