// ~/utils/queries.js
import { getPrismicClient } from './prismic';

async function fetchDocs(page = 1, routes = []) {
    const response = await getPrismicClient().query('', { pageSize: 100, lang: '*', page });
    const allRoutes = routes.concat(response.results);
    if (response.results_size + routes.length < response.total_results_size) {
        return fetchDocs(page + 1, allRoutes);
    }
    const nSet = new Set(allRoutes);
    return [...nSet];
};

/** Fetches all Prismic documents and filters them (eg. by document type).
 *  In production, you would probably query documents by type instead of filtering them.
**/
export const queryRepeatableDocuments = async (filter) => {
    const allRoutes = await fetchDocs()
    return allRoutes.filter(filter)
}