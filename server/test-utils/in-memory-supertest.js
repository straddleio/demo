import http from 'node:http';
import { Duplex } from 'node:stream';
import { deepStrictEqual } from 'node:assert';

function toBuffer(chunk, encoding) {
  if (chunk === undefined || chunk === null) {
    return null;
  }
  return Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined);
}

async function executeRequest(app, method, path, headers, body) {
  const normalizedHeaders = {};
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      normalizedHeaders[key.toLowerCase()] = String(value);
    });
  }

  let payloadBuffer = null;
  if (body !== undefined) {
    if (Buffer.isBuffer(body)) {
      payloadBuffer = body;
    } else if (typeof body === 'object') {
      payloadBuffer = Buffer.from(JSON.stringify(body));
      if (!normalizedHeaders['content-type']) {
        normalizedHeaders['content-type'] = 'application/json';
      }
    } else {
      payloadBuffer = Buffer.from(String(body));
      if (!normalizedHeaders['content-type']) {
        normalizedHeaders['content-type'] = 'text/plain';
      }
    }
    normalizedHeaders['content-length'] = Buffer.byteLength(payloadBuffer).toString();
  }

  return await new Promise((resolve, reject) => {
    const socket = new Duplex({
      read() {},
      write(chunk, enc, cb) {
        cb();
      },
    });
    socket.remoteAddress = '127.0.0.1';

    const req = new http.IncomingMessage(socket);
    req.method = method.toUpperCase();
    req.url = path;
    req.headers = normalizedHeaders;

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    const chunks = [];
    const originalWrite = res.write.bind(res);
    res.write = (chunk, encoding, cb) => {
      const buf = toBuffer(chunk, encoding);
      if (buf) {
        chunks.push(buf);
      }
      return originalWrite(chunk, encoding, cb);
    };

    const originalEnd = res.end.bind(res);
    res.end = (chunk, encoding, cb) => {
      const buf = toBuffer(chunk, encoding);
      if (buf) {
        chunks.push(buf);
      }
      return originalEnd(chunk, encoding, cb);
    };

    const finalize = () => {
      const text = Buffer.concat(chunks).toString();
      const resHeaders = {};
      Object.entries(res.getHeaders()).forEach(([key, value]) => {
        resHeaders[key.toLowerCase()] = value;
      });
      const contentType = res.getHeader('content-type');
      let parsedBody = text;
      if (contentType && String(contentType).includes('application/json')) {
        try {
          parsedBody = text ? JSON.parse(text) : {};
        } catch {
          // Leave as text if parsing fails
        }
      }

      resolve({
        status: res.statusCode,
        statusCode: res.statusCode,
        body: parsedBody,
        text,
        headers: resHeaders,
      });
    };

    res.on('finish', finalize);
    res.on('error', reject);

    try {
      app.handle(req, res);
    } catch (error) {
      reject(error);
      return;
    }

    if (payloadBuffer) {
      req.push(payloadBuffer);
    }
    req.push(null);
  });
}

class RequestRunner {
  constructor(app, method, path) {
    this.app = app;
    this.method = method;
    this.path = path;
    this.headers = {};
    this._responsePromise = null;
    this._body = undefined;
  }

  set(field, value) {
    if (typeof field === 'object' && field !== null) {
      Object.assign(this.headers, field);
    } else if (typeof field === 'string') {
      this.headers[field] = value;
    }
    return this;
  }

  send(body) {
    this._body = body;
    return this;
  }

  expect(expectedStatus, expectedBody) {
    return this._execute().then((res) => {
      if (typeof expectedStatus === 'number' && res.status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus} but received ${res.status}`);
      }
      if (expectedBody !== undefined) {
        deepStrictEqual(res.body, expectedBody);
      }
      return res;
    });
  }

  _execute() {
    if (!this._responsePromise) {
      this._responsePromise = executeRequest(
        this.app,
        this.method,
        this.path,
        this.headers,
        this._body
      );
    }
    return this._responsePromise;
  }

  then(onFulfilled, onRejected) {
    return this._execute().then(onFulfilled, onRejected);
  }
}

class SupertestAdapter {
  constructor(app) {
    this.app = app;
  }

  get(path) {
    return new RequestRunner(this.app, 'GET', path);
  }

  post(path) {
    return new RequestRunner(this.app, 'POST', path);
  }

  put(path) {
    return new RequestRunner(this.app, 'PUT', path);
  }

  patch(path) {
    return new RequestRunner(this.app, 'PATCH', path);
  }

  delete(path) {
    return new RequestRunner(this.app, 'DELETE', path);
  }

  options(path) {
    return new RequestRunner(this.app, 'OPTIONS', path);
  }
}

export default function request(app) {
  return new SupertestAdapter(app);
}
