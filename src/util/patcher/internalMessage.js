let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;

  const { BOT_AVATARS } = hypercordScope.webpackModules.findByProps('BOT_AVATARS', 'DEFAULT_AVATARS');

  BOT_AVATARS.hypercord = 'https://files.catbox.moe/jzb4v2.png'; // Add avatar image
};


export const send = (content, author = 'hypercord') => {
  // Get Webpack Modules
  const { createBotMessage } = hypercordScope.webpackModules.findByProps('createBotMessage');
  const { getChannelId } = hypercordScope.webpackModules.findByProps('getChannelId');
  const { receiveMessage } = hypercordScope.webpackModules.findByProps('receiveMessage', 'sendBotMessage');

  const msg = createBotMessage(getChannelId(), '');

  if (typeof content === 'string') {
    msg.content = content;
  } else {
    msg.embeds.push(content);
  }

  msg.state = 'SENT'; // Set Clyde-like props
  msg.author.id = '1';
  msg.author.bot = true;
  msg.author.discriminator = '0000';

  msg.author.avatar = 'hypercord'; // Allow custom avatar URLs in future? (via dynamic BOT_AVATARS adding)
  msg.author.username = author;

  receiveMessage(getChannelId(), msg);
};