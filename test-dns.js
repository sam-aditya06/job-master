import dns from 'dns';

dns.resolveSrv('__mongodb._tcp.cluster0.hsshaga.mongodb.net', (err, records) => {
  console.log(err, records);
});
