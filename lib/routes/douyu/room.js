import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        id
    } = ctx.params;

    const response = await got({
        method: 'get',
        url: `http://open.douyucdn.cn/api/RoomApi/room/${id}`,
        headers: {
            Referer: `https://www.douyu.com/${id}`,
        },
    });

    const {
        data
    } = response.data;

    let item;
    if (data.online !== 0) {
        item = [
            {
                title: `开播: ${data.room_name}`,
                pubDate: new Date(data.start_time).toUTCString(),
                guid: data.start_time,
                link: `https://www.douyu.com/${id}`,
            },
        ];
    }

    ctx.state.data = {
        title: `${data.owner_name}的斗鱼直播间`,
        link: `https://www.douyu.com/${id}`,
        item,
        allowEmpty: true,
    };
};