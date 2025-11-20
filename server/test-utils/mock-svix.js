class Webhook {
  constructor(secret) {
    this.secret = secret || '';
  }

  sign(msgId, timestamp, payload) {
    const ts =
      typeof timestamp === 'string'
        ? timestamp
        : Math.floor(timestamp.getTime() / 1000).toString();
    const base = `${msgId}.${ts}.${payload}.${this.secret}`;
    const signature = Buffer.from(base).toString('base64');
    return `v1.${signature}`;
  }

  verify(payload, headers) {
    const signature = headers['svix-signature'] || headers['webhook-signature'] || '';
    if (signature === 'v1,badsignature' || !signature) {
      throw new Error('No matching signature found');
    }
    return payload;
  }
}

export { Webhook };
export default { Webhook };
