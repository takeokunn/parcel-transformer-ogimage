import { Bundler } from '@parcel/plugin';

export default new Bundler({
    async bundle({ graph }) {
        console.log("good");
    }
});
