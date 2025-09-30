import https from 'node:https';

const url = 'https://portal.theclearpath.ae/api/health';

https
  .get(url, (res) => {
    const { statusCode } = res;
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      const ok = statusCode === 200 && /ok|healthy|alive/i.test(body);
      console.log(JSON.stringify({ url, statusCode, body, ok }));
      process.exit(ok ? 0 : 1);
    });
  })
  .on('error', (error) => {
    console.error(JSON.stringify({ url, error: error.message }));
    process.exit(2);
  });
