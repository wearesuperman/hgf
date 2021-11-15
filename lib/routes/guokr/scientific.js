import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const response = await got.get('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const {
        result
    } = response.data;

    ctx.state.data = {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: await Promise.all(
            result.map((item) =>
                ctx.cache.tryGet(item.url, async () => {
                    const res = await got.get(item.url);
                    const $ = cheerio.load(res.data);
                    item.description = $('.eflYNZ #js_content').css('visibility', 'visible').html() || $('.bPfFQI').html();
                    return {
                        title: item.title,
                        description: item.description,
                        pubDate: item.date_published,
                        link: item.url,
                        author: item.author.nickname,
                    };
                })
            )
        ),
    };
};