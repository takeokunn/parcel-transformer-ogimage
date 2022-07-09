const url = require('url');
const { Transformer } = require('@parcel/plugin');

const getMetaPropertyTag = (html, property) => {
    const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
    const results = regex.exec(html);

    if (!results) {
        throw new Error(`Missing ${property}`);
    }

    return results[0];
};

const getMetaNameTag = (html, name) => {
    const regex = new RegExp(`<meta[^>]*name=["|']${name}["|'][^>]*>`, 'i');
    const results = regex.exec(html);

    if (!results) {
        throw new Error(`Missing ${name}`);
    }

    return results[0];
};


const getMetaTagContent = (metaTagHtml) => {
    const contentRegex = /content="([^"]*)"/i;
    const results = contentRegex.exec(metaTagHtml);

    if (!results) {
        throw new Error(`Missing content attribute in ${chalk.bold(metaTagHtml)}`);
    }

    return results[1];
};

module.exports = new Transformer({
    async transform({ asset }) {
        const baseHtml = await asset.getCode();
        try {
            const ogUrlTag = getMetaPropertyTag(baseHtml, 'og:url');
            const ogImageTag = getMetaPropertyTag(baseHtml, 'og:image');
            const twitterImageTag = getMetaNameTag(baseHtml, 'twitter:image');

            const ogUrlContent = getMetaTagContent(ogUrlTag);
            const ogImageContent = getMetaTagContent(ogImageTag);
            const twtiterImageContent = getMetaTagContent(twitterImageTag);

            const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
            const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
            const twitterImageTagAbsoluteUrl = twitterImageTag.replace(twtiterImageContent, absoluteOgImageUrl);

            let patchedHtml = baseHtml.replace(ogImageTag, ogImageTagAbsoluteUrl);
            patchedHtml = patchedHtml.replace(twitterImageTag, twitterImageTagAbsoluteUrl);

            asset.setCode(patchedHtml);
        } catch (error) {
            console.log(error.message);
        }

        return [asset];
    }
});
