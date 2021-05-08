const url = require('url');
const {Transformer} = require('@parcel/plugin');

const getMetaTag = (html, property) => {
    const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
    const results = regex.exec(html);

    if (!results) {
	throw new Error(`Missing ${property}`);
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
        const html = await asset.getCode();
        try {
            const ogImageTag = getMetaTag(html, 'og:image');
            console.log(ogImageTag);
	    const ogImageContent = getMetaTagContent(ogImageTag);


	    const ogUrlTag = getMetaTag(html, 'og:url');
	    const ogUrlContent = getMetaTagContent(ogUrlTag);

	    const absoluteOgImageUrl = url.resolve(ogUrlContent, ogImageContent);
	    const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl);
	    const patchedHtml = html.replace(ogImageTag, ogImageTagAbsoluteUrl);

            asset.setCode(patchedHtml);
        } catch (error) {
            console.log(error.message);
        }

        return [asset];
    }
});
