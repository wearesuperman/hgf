import got from '~/utils/got.js';
import cheerio from 'cheerio';

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const datestr = $('aside > time').attr('datetime');
    const description = $('article > div.flex-l').html();
    return { description, datestr };
}

const ProcessFeed = async (title, url, caches) => {
    const single = {
        title,
        link: url,
        guid: url,
    };
    const other = await caches.tryGet(url, async () => await load(url));
    return {
        ...single,
        ...other
    };
};

export default async (ctx) => {
    const host = 'https://gohugo.io/categories/releases';

    const response = await got({
        method: 'get',
        url: host,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('section > div > div > h1')
            .get()
            .map(async (item) => {
                const node = $('a', item);
                const title = node.text();
                const url = new URL(node.attr('href'), 'https://gohugo.io/').href;
                const result = await ProcessFeed(title, url, ctx.cache);
                return result;
            })
    );

    ctx.state.data = {
        title: 'Hugo Release',
        link: host,
        description: 'Hugo Release',
        item: items,
    };
};