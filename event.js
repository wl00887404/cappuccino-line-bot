const { groupBitches, groupChen } = process.env;

const Penguin = {
  name: 'Penguin',
  rule: /72/,
  resolve: async (context) => {
    const url = 'https://i.imgur.com/8OBLFwV.jpg';
    context.sendImage(url, url);
  },
};

const ShutUp = {
  name: 'ShutUp',
  rule: /閉嘴/,
  resolve: async (context) => {
    await context.sendText('你才閉嘴啦');
  },
};

const GoodMorning = {
  name: 'GoodMorning',
  rule: /早安/,
  resolve: async (context) => {
    await context.sendText('大家早安');
  },
};

const setEcho = intent => async (context, store) => {
  store.dispatch({
    type: 'set_echo',
  });
  await context.sendText(`# 鸚鵡模式${intent ? '啟動' : '關閉'}`);
};

const Stop = {
  name: 'Stop',
  rule: /stop/,
  resolve: setEcho(false),
};

const Start = {
  name: 'Start',
  rule: /start/,
  resolve: setEcho(true),
};

const Echo = {
  name: 'Echo',
  rule: /echo/,
  cons: [Start, Stop],
};

const Bitch = {
  name: 'Bitch',
  rule: /陳奕宏/,
  resolve: async (context) => {
    await context.sendText('他媽的臭婊子');
  },
};

const YesOrNo = {
  name: 'YesOrNo',
  rule: /好[嗎,不好]/,
  resolve: async (context) => {
    const randomBool = Math.floor(Math.random() * 1000) % 2;
    await context.sendText(randomBool ? '好！' : '不好吧...');
  },
};

const Capu = {
  name: 'Capu',
  rule: /^卡布/,
  cons: [Bitch, YesOrNo, Echo, GoodMorning, ShutUp],
};

const Log = {
  name: 'Log',
  rule: true,
  resolve: async (context) => {
    const result = {};
    const { type, user } = context.session;
    const { text } = context.event;
    Object.assign(result, { type, text });
    if (type === 'group' && context.session.group) {
      const { id: group } = context.session.group;
      Object.assign(result, { group });
    }
    if (user) {
      const { userId: id, displayName, pictureUrl } = user;
      Object.assign(result, { user: { id, displayName, pictureUrl } });
    }
    console.log(result);
  },
};

const PushImage = {
  name: 'Push',
  rule: /對群組傳圖片/,
  resolve: async (context, store, client) => {
    const { user, type } = context.session;
    if (type === 'user' && user) {
      const { text } = context.event;
      const url = text.slice(text.indexOf('對群組傳圖片') + 6).trim();
      client.pushImage(groupBitches, url, url);
    }
  },
};

const PushChen = {
  name: 'PushChen',
  rule: /對後宮群組說/,
  resolve: async (context, store, client) => {
    const { user, type } = context.session;
    if (type === 'user' && user) {
      const { text } = context.event;
      const replyText = text.slice(text.indexOf('對後宮群組說') + 6).trim();
      client.pushText(groupChen, replyText);
    }
  },
};

const Push = {
  name: 'Push',
  rule: /對群組說/,
  resolve: async (context, store, client) => {
    const { user, type } = context.session;
    if (type === 'user' && user) {
      const { text } = context.event;
      const replyText = text.slice(text.indexOf('對群組說') + 4).trim();
      client.pushText(groupBitches, replyText);
    }
  },
};

const Index = {
  name: 'Index',
  rule: true,
  resolve: async (context, store) => {
    const { echo } = store.getState();
    if (echo) {
      const { text } = context.event;
      await context.sendText(text);
    }
  },
  cons: [Log, Push, PushChen, PushImage, Penguin, Capu],
};

const execRule = (rule, text) => {
  if (typeof rule === 'function') {
    return rule(text);
  } else if (rule instanceof RegExp) {
    return rule.test(text);
  }
  return rule;
};

const exec = async (node, context, store, client) => {
  const { rule, resolve = () => {}, cons = [] } = node;
  const { text } = context.event;
  if (execRule(rule, text)) {
    await resolve(context, store, client);
    await Promise.all(cons.map(nextNode => exec(nextNode, context, store, client)));
  }
};

module.exports = exec.bind(null, Index);

