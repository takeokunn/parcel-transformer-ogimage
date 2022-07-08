const url = require('url');
const { Transformer } = require('@parcel/plugin');

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
        const imageTags = ['og:image', 'twitter:image'];
        try {
            const ogUrlTag = getMetaTag(html, 'og:url');
            const ogUrlContent = getMetaTagContent(ogUrlTag);
            let patchedHtml = html;
            imageTags.forEach(tag => {
                try {
                    const imageTag = getMetaTag(html, tag);
                    const imageTagContent = getMetaTagContent(imageTag);
                    const absoluteImageUrl = url.resolve(ogUrlContent, imageTagContent);
                    const imageTagAbsoluteUrl = imageTag.replace(imageTagContent, absoluteImageUrl);
                    patchedHtml = patchedHtml.replace(imageTag, imageTagAbsoluteUrl);
                } catch (error) {
                    console.log(error.message);
                }
            });

            asset.setCode(patchedHtml);
        } catch (error) {
            console.log(error.message);
        }

        return [asset];
    }
});
