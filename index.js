var Spider = require('./built')
var client = new Spider["default"]({
  server: '127.0.0.1',
  port: 3000
})
client.run()

