import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.monsterhunter.com/world-iceborne/cn/news/';
    const response = await got({
        method: 'get',
        url: `https://www.monsterhunter.com/world-iceborne/assets/data/cn/news.json?_=${+new Date()}`,
    });

    let result = response.data.topics.map((item) => ({
        title: item.text,
        img: item.img,
        link: `https://www.monsterhunter.com${item.link}`,
    }));

    result = await Promise.all(
        result.map(async (item) =>
            Promise.resolve(
                await ctx.cache.tryGet(item.link, async () => {
                    let title;
                    let description;
                    try {
                        const response = await got.get(item.link.replace('/cn/', '/') + 'inc/contents_cn.html');
                        const $ = cheerio.load(response.data);
                        title = $('.bg-h2').text().trim();
                        description = $('#contents').html();
                    } catch {
                        title = item.title;
                        description = `<img src="https://www.monsterhunter.com/world-iceborne/${item.img}">`;
                    }

                    return {
                        title,
                        description,
                        link: item.link,
                        author: 'MONSTER HUNTER WORLD: ICEBORNE',
                    };
                })
            )
        )
    );

    ctx.state.data = {
        title: '怪物猎人世界最新消息',
        link: url,
        item: result,
    };
};