import got from '~/utils/got.js';
import cheerio from 'cheerio';
// /iqiyi/user/video/:uid
// http://localhost:1200/iqiyi/user/video/2289191062
export default async (ctx) => {
    const {
        uid
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: `http://www.iqiyi.com/u/${uid}/v`,
        headers: {
            Host: 'www.iqiyi.com',
            Referer: `http://www.iqiyi.com/u/${uid}/v`,
        },
    });
    const $ = cheerio.load(data);
    const description = '';

    const list = $('li[j-delegate="colitem"]');

    ctx.state.data = {
        title: $('title').text(),
        link: `http://www.iqiyi.com/u/${uid}/v`,
        description,
        item:
            list &&
            list
                .map((index, item) => {
                    const title = $(item).find('.site-piclist_pic a').attr('data-title');

                    return {
                        title,
                        description: `<img src="${$(item).find('.site-piclist_pic img').attr('src')}">`,
                        pubDate: new Date($(item).find('.playTimes_status.tl').text().substring(0, 10).replace(/-/g, '/')).toUTCString(),
                        link: $(item).find('.site-piclist_pic a').attr('href'),
                    };
                })
                .get(),
        // .reverse(),
    };
};