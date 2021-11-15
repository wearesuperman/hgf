import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        uid
    } = ctx.params;
    const url = `http://www.acfun.cn/u/${uid}.aspx`;
    const host = 'http://www.acfun.cn';
    const {
        data
    } = await got({
        method: 'get',
        url,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(data);
    const title = $('title').text();
    const description = $('.preview').text();
    const list = $('#ac-space-video-list a').get();

    ctx.state.data = {
        title,
        link: url,
        description,
        item: list
            .map((item) => {
                const $ = cheerio.load(item);

                const itemTitle = $('p.title').text();
                const itemImg = $('figure img').attr('src');
                const itemUrl = $('a').attr('href');
                const itemDate = $('.date').text();

                return {
                    title: itemTitle,
                    description: `<img src="${itemImg}">`,
                    link: host + itemUrl,
                    pubDate: new Date(itemDate).toUTCString(),
                };
            })
            .reverse(),
    };
};