var Spider = require('./dist')

var client = new Spider({
  server: 'filowlee.com',
  port: 3000
})
client.run()

