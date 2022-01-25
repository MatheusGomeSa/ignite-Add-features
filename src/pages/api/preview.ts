import { linkResolver } from '../../../prismicConfiguration' // import from wherever this is set
import { getPrismicClient } from '../../services/prismic';

export default async (req, res) => {
    const { token: ref, documentId } = req.query;
    const redirectUrl = await getPrismicClient(req)
        .getPreviewResolver(ref, documentId)
        .resolve(linkResolver, '/');

    if (!redirectUrl) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    res.setPreviewData({ ref });

    res.write(
        `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
    );
    res.end();
};