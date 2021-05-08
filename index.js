import {Transform} from '@parcel/plugin';

export default new Transform({
  async parse({asset}) {
    // ...
    return ast;
  },

  async transform({asset}) {
    // ...
    return [assets];
  },

  async generate({asset}) {
    // ...
    return {code, map};
  }
});
