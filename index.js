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

const getAbsoluteOgImageUrl = (baseHtml) => {
    try {
        const ogUrlTag = getMetaPropertyTag(baseHtml, 'og:url');
        return getMetaTagContent(ogUrlTag);
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = new Transformer({
    async transform({ asset }) {
        const baseHtml = await asset.getCode();
        let patchedHtml = baseHtml;

        const ogUrlContent = getAbsoluteOgImageUrl(baseHtml);

        if(!ogUrlContent) return [asset];

        // for og:image
        try {
            const ogImageTag = getMetaPropertyTag(baseHtml, 'og:image');
            const ogImageContent = getMetaTagContent(ogImageTag);
            const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
            const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
            patchedHtml = baseHtml.replace(ogImageTag, ogImageTagAbsoluteUrl);
            asset.setCode(patchedHtml);
        } catch (error) {
            console.log(error.message);
        }

        // for twitter:image
        try {
            const twitterImageTag = getMetaNameTag(baseHtml, 'twitter:image');
            const twtiterImageContent = getMetaTagContent(twitterImageTag);
            const absoluteTwitterImageUrl = url.resolve(ogUrlContent, twtiterImageContent);
            const twitterImageTagAbsoluteUrl = twitterImageTag.replace(twtiterImageContent, absoluteTwitterImageUrl);
            patchedHtml = patchedHtml.replace(twitterImageTag, twitterImageTagAbsoluteUrl);
            asset.setCode(patchedHtml);
        } catch (error) {
            console.log(error.message);
        }

        return [asset];
    }
});
