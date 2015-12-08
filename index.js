var Spider = require('./built')
var client = new Spider["default"]({
  server: 'filowlee.com',
  port: 3000
})
client.run()

